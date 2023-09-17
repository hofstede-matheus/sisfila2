import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClientInQueue,
  QueueEntity,
} from '../../../domain/entities/Queue.entity';
import { QueueRepository } from '../../../domain/repositories/QueueRepository';
import { Queue } from '../entities/queues.typeorm-entity';
import { GroupEntity } from '../../../../groups/domain/entities/Group.entity';
import { Either, left, right } from '../../../../common/shared/helpers/either';
import { DomainError } from '../../../../common/shared/helpers/errors';
import {
  NoQueueAvaliabeError,
  UserNotInAnyGroupError,
} from '../../../../common/domain/errors';

export class TypeOrmQueuesRepository implements QueueRepository {
  constructor(
    @InjectRepository(Queue)
    private readonly queuesRepository: Repository<Queue>,
  ) {}

  async attachServiceToQueue(
    serviceId: string,
    queueId: string,
  ): Promise<void> {
    await this.queuesRepository.update(
      { id: queueId },
      { service_id: serviceId },
    );
  }

  async callClient(
    callerId: string,
    queueId: string,
    clientId: string,
  ): Promise<void> {
    await this.queuesRepository.query(
      `
        UPDATE clients_position_in_queues
        SET
          attended_by_user = $1,
          called_at = now()
        WHERE
          queue_id = $2
        AND
          client_id = $3;
        `,
      [callerId, queueId, clientId],
    );
  }

  async attachClientToQueueByServiceIdOrganizationIdRegistrationId(
    serviceId: string,
    organizationId: string,
    userId: string,
  ): Promise<
    Either<
      DomainError,
      {
        queueId: string;
        queueName: string;
        position: number;
      }
    >
  > {
    let queuesOrderedByPriority = [];
    await this.queuesRepository.manager.transaction(async (transaction) => {
      const groupsThatUserBelongs = await transaction.query(
        `
      SELECT
        groups.id
      FROM groups
      INNER JOIN clients_in_groups ON groups.id = clients_in_groups.group_id
      WHERE clients_in_groups.client_id = $1
      `,
        [userId],
      );

      const groupsThatUserBelongsIds = groupsThatUserBelongs.map(
        (group) => group.id,
      );

      if (groupsThatUserBelongsIds.length === 0) {
        return left(new UserNotInAnyGroupError());
      }

      const queuesAssociatedWithGroups = await transaction.query(
        `
      SELECT
        groups_from_queues.queue_id
      FROM groups_from_queues
      WHERE groups_from_queues.group_id = ANY($1)
      `,
        [groupsThatUserBelongsIds],
      );

      if (queuesAssociatedWithGroups.length === 0) {
        return left(new NoQueueAvaliabeError());
      }

      const queuesAssociatedWithGroupsIds = queuesAssociatedWithGroups.map(
        (queue) => queue.queue_id,
      );

      queuesOrderedByPriority = await transaction.query(
        `
      SELECT
        queues.id,
        queues.name
      FROM queues
      WHERE queues.service_id = $1
      AND queues.organization_id = $2
      AND queues.id IN ($3)
      ORDER BY queues.priority DESC
      `,
        [serviceId, organizationId, queuesAssociatedWithGroupsIds.join(',')],
      );

      const userAlreadyInQueue = await transaction.query(
        `
      SELECT
        clients_position_in_queues.queue_id
      FROM clients_position_in_queues
      WHERE clients_position_in_queues.client_id = $1
      `,
        [userId],
      );

      if (userAlreadyInQueue.length === 0) {
        await transaction.query(
          `INSERT INTO clients_position_in_queues (client_id, queue_id) VALUES ($1, $2)`,
          [userId, queuesOrderedByPriority[0].id],
        );
      }
    });

    // TODO: ver se esse check realmente é necessário, comentado pra ver se quebra
    // if (queuesOrderedByPriority.length === 0) {
    //   return;
    // }

    const user = await this.queuesRepository.query(
      `
      SELECT
        clients.registration_id
      FROM clients
      WHERE clients.id = $1
      `,
      [userId],
    );

    const position = await this.getPositionOfClient(
      queuesOrderedByPriority[0].id,
      user[0].registration_id,
    );

    return right({
      queueId: queuesOrderedByPriority[0].id,
      queueName: queuesOrderedByPriority[0].name,
      position: position + 1,
    });
  }

  async getPositionOfClient(
    queueId: string,
    registrationId: string,
  ): Promise<number> {
    const clientsInQueueFromDatabase = await this.queuesRepository.query(
      `
      SELECT 
        clients.id, 
        clients.name, 
        clients.organization_id, 
        clients.registration_id,
        clients_position_in_queues.called_at,
        clients_position_in_queues.attended_by_user,
        clients.created_at, 
        clients.updated_at
      FROM clients
      INNER JOIN clients_position_in_queues ON clients.id = clients_position_in_queues.client_id
      WHERE clients_position_in_queues.queue_id = $1
      AND clients_position_in_queues.called_at IS NULL
      ORDER BY clients_position_in_queues.created_at ASC
      `,
      [queueId],
    );

    const clientsInQueue: ClientInQueue[] = clientsInQueueFromDatabase.map(
      (client) => {
        return {
          id: client.id,
          name: client.name,
          organizationId: client.organization_id,
          registrationId: client.registration_id,
          calledDate: client.called_at,
          createdAt: client.created_at,
          updatedAt: client.updated_at,
          attendedByUserId: client.attended_by_user,
        } as ClientInQueue;
      },
    );

    const position = clientsInQueue.findIndex(
      (client) => client.registrationId === registrationId,
    );
    return position;
  }

  async callNextClient(queueId: string): Promise<void> {
    await this.queuesRepository.manager.transaction(async (transaction) => {
      const firstClientFromQueue = await transaction.query(
        `
        select 
          id
        FROM clients_position_in_queues
        WHERE queue_id = $1
        and called_at is null
        ORDER BY clients_position_in_queues.created_at ASC
        LIMIT 1
        `,
        [queueId],
      );

      await transaction.query(
        `
        UPDATE clients_position_in_queues 
        SET 
          called_at = now() 
        WHERE 
          id = $1;
        `,
        [firstClientFromQueue[0].id],
      );
    });
  }

  async findById(queueId: string): Promise<QueueEntity> {
    const queue = await this.queuesRepository.findOne({
      where: { id: queueId },
    });

    const clientsInQueueFromDatabase = await this.queuesRepository.query(
      `
      SELECT 
        clients.id, 
        clients.name, 
        clients.organization_id, 
        clients.registration_id,
        clients_position_in_queues.called_at,
        clients_position_in_queues.attended_by_user,
        clients.created_at, 
        clients.updated_at
      FROM clients
      INNER JOIN clients_position_in_queues ON clients.id = clients_position_in_queues.client_id
      WHERE clients_position_in_queues.queue_id = $1
      AND clients_position_in_queues.called_at IS NULL
      ORDER BY clients_position_in_queues.created_at ASC
      `,
      [queueId],
    );

    const lastClientCalled = await this.queuesRepository.query(
      `
      SELECT
        clients.id,
        clients.name,
        clients.organization_id,
        clients.registration_id,
        clients_position_in_queues.called_at,
        clients_position_in_queues.attended_by_user,
        clients.created_at,
        clients.updated_at
      FROM clients
      INNER JOIN clients_position_in_queues ON clients.id = clients_position_in_queues.client_id
      WHERE clients_position_in_queues.queue_id = $1
      AND clients_position_in_queues.called_at IS NOT NULL
      ORDER BY clients_position_in_queues.called_at DESC
      LIMIT 1
      `,
      [queueId],
    );

    const clientsInQueue: ClientInQueue[] = clientsInQueueFromDatabase.map(
      (client) => {
        return {
          id: client.id,
          name: client.name,
          organizationId: client.organization_id,
          registrationId: client.registration_id,
          calledDate: client.called_at,
          createdAt: client.created_at,
          updatedAt: client.updated_at,
          attendedByUserId: client.attended_by_user,
        } as ClientInQueue;
      },
    );

    const groupsFromQueue = await this.getGroupsFromQueue(queueId);

    return {
      id: queue.id,
      name: queue.name,
      code: queue.code,
      priority: queue.priority,
      description: queue.description,
      organizationId: queue.organization_id,
      serviceId: queue.service_id,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
      clientsInQueue: clientsInQueue,
      lastClientCalled: lastClientCalled[0]
        ? ({
            id: lastClientCalled[0].id,
            name: lastClientCalled[0].name,
            organizationId: lastClientCalled[0].organization_id,
            registrationId: lastClientCalled[0].registration_id,
            calledDate: lastClientCalled[0].called_at,
            createdAt: lastClientCalled[0].created_at,
            updatedAt: lastClientCalled[0].updated_at,
            attendedByUserId: lastClientCalled[0].attended_by_user,
          } as ClientInQueue)
        : undefined,
      groups: groupsFromQueue,
    };
  }

  async attachClientToQueue(userId: string, queueId: string): Promise<void> {
    return this.queuesRepository.query(
      `INSERT INTO clients_position_in_queues (client_id, queue_id) VALUES ($1, $2)`,
      [userId, queueId],
    );
  }

  async attachGroupsToQueue(
    groupIds: string[],
    queueId: string,
  ): Promise<void> {
    for (const groupId of groupIds) {
      await this.queuesRepository.query(
        `INSERT INTO groups_from_queues (queue_id, group_id) VALUES ($1, $2)`,
        [queueId, groupId],
      );
    }
  }

  async findByOrganizationId(organizationId: string): Promise<QueueEntity[]> {
    const queues = await this.queuesRepository.find({
      where: { organization_id: organizationId },
    });

    const mappedQueues = [];
    for (const queue of queues) {
      mappedQueues.push({
        id: queue.id,
        name: queue.name,
        code: queue.code,
        priority: queue.priority,
        description: queue.description,
        organizationId: queue.organization_id,
        serviceId: queue.service_id,
        createdAt: queue.createdAt,
        updatedAt: queue.updatedAt,
        groups: await this.getGroupsFromQueue(queue.id),
      });
    }

    return mappedQueues;
  }

  async create(
    name: string,
    priority: number,
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<QueueEntity> {
    const queueEntity = this.queuesRepository.create({
      name,
      description,
      code,
      priority,
      organization_id: organizationId,
      service_id: serviceId,
    });

    const queueInDatabase = await this.queuesRepository.save(queueEntity);

    return {
      id: queueInDatabase.id,
      name: queueInDatabase.name,
      code: queueInDatabase.code,
      priority: queueInDatabase.priority,
      description: queueInDatabase.description,
      organizationId: queueInDatabase.organization_id,
      serviceId: queueInDatabase.service_id,
      createdAt: queueInDatabase.createdAt,
      updatedAt: queueInDatabase.updatedAt,
      clientsInQueue: [],
      groups: [],
    };
  }

  async findByServiceId(serviceId: string): Promise<QueueEntity[]> {
    const queues = await this.queuesRepository.find({
      where: { service_id: serviceId },
    });

    const queuesPromises = queues.map(async (queue) => {
      return this.findById(queue.id);
    });

    const queuesWithClients = await Promise.all(queuesPromises);

    return queuesWithClients;
  }

  private async getGroupsFromQueue(queueId: string): Promise<GroupEntity[]> {
    const groupsFromQueueFromDatabase = await this.queuesRepository.query(
      `
      SELECT
        groups.id,
        groups.name,
        groups.organization_id,
        groups.created_at,
        groups.updated_at
      FROM groups
      INNER JOIN groups_from_queues ON groups.id = groups_from_queues.group_id
      WHERE groups_from_queues.queue_id = $1
      `,
      [queueId],
    );

    const groupsFromQueue: GroupEntity[] = groupsFromQueueFromDatabase.map(
      (group) => {
        return {
          id: group.id,
          name: group.name,
          organizationId: group.organization_id,
          createdAt: group.created_at,
          updatedAt: group.updated_at,
        };
      },
    );

    return groupsFromQueue;
  }
}
