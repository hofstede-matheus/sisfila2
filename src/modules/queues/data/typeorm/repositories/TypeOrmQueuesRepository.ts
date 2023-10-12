import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import {
  ClientInQueue,
  PositionInQueueWithDesk,
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

  async setPriority(queueId: string): Promise<void> {
    const queue = await this.queuesRepository.findOne({
      where: { id: queueId },
    });

    const queuesFromServiceCount = await this.queuesRepository.count({
      where: { service_id: queue.service_id, id: Not(queueId) },
    });

    if (queuesFromServiceCount === 0) {
      await this.queuesRepository.update({ id: queueId }, { priority: 1 });
    } else {
      await this.queuesRepository.update(
        { id: queueId },
        { priority: queuesFromServiceCount + 1 },
      );
    }
  }

  async selectBestQueueForClient(
    serviceId: string,
    organizationId: string,
    registrationId: string,
  ): Promise<QueueEntity> {
    const user = await this.queuesRepository.query(
      `
      SELECT
        clients.id
      FROM clients
      WHERE clients.registration_id = $1
      AND clients.organization_id = $2
      `,
      [registrationId, organizationId],
    );
    const userId = user[0].id;

    console.log('userId', userId);

    let queuesOrderedByPriority = [];
    const groupsThatUserBelongs = await this.queuesRepository.query(
      `
      SELECT
        groups.id
      FROM groups
      INNER JOIN clients_in_groups ON groups.id = clients_in_groups.group_id
      WHERE clients_in_groups.client_id = $1
      AND groups.organization_id = $2
      `,
      [userId, organizationId],
    );

    console.log('groupsThatUserBelongs', groupsThatUserBelongs);

    const groupsThatUserBelongsIds = groupsThatUserBelongs.map(
      (group) => group.id,
    );

    console.log('groupsThatUserBelongsIds', groupsThatUserBelongsIds);

    const queuesAssociatedWithGroups = await this.queuesRepository.query(
      `
      SELECT
        groups_from_queues.queue_id
      FROM groups_from_queues
      WHERE groups_from_queues.group_id = ANY($1)
      `,
      [groupsThatUserBelongsIds],
    );

    console.log('queuesAssociatedWithGroups', queuesAssociatedWithGroups);

    const queuesAssociatedWithGroupsIds = queuesAssociatedWithGroups.map(
      (queue) => queue.queue_id,
    );

    console.log('queuesAssociatedWithGroupsIds', queuesAssociatedWithGroupsIds);

    queuesOrderedByPriority = await this.queuesRepository.query(
      `
      SELECT
        queues.id,
        queues.name
      FROM queues
      WHERE queues.service_id = $1
      AND queues.organization_id = $2
      AND queues.id = ANY($3)
      ORDER BY queues.priority DESC
      `,
      [serviceId, organizationId, queuesAssociatedWithGroupsIds],
    );

    console.log('queuesOrderedByPriority', queuesOrderedByPriority);

    return {
      id: queuesOrderedByPriority[0].id,
      name: queuesOrderedByPriority[0].name,
      code: undefined,
      priority: undefined,
      description: undefined,
      organizationId: undefined,
      serviceId: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      clientsInQueue: [],
      groups: [],
    };
  }

  async remove(queueId: string): Promise<void> {
    await this.queuesRepository.delete({ id: queueId });
  }

  async update(
    queueId: string,
    name?: string,
    description?: string,
    code?: string,
    priority?: number,
  ): Promise<QueueEntity> {
    await this.queuesRepository.save({
      id: queueId,
      name,
      description,
      code,
      priority,
    });

    const queue = await this.findById(queueId);
    return queue;
  }

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
    deskId: string,
  ): Promise<void> {
    // open transaction
    await this.queuesRepository.manager.transaction(async (transaction) => {
      const clientsPositionInQueuesId = await transaction.query(
        `
        SELECT
          clients_position_in_queues.id
        FROM clients_position_in_queues
        WHERE clients_position_in_queues.queue_id = $1
        AND clients_position_in_queues.client_id = $2
        AND clients_position_in_queues.called_at IS NULL
        `,
        [queueId, clientId],
      );

      // update
      await transaction.query(
        `
        UPDATE clients_position_in_queues
        SET
          attended_by_user = $1,
          called_at = now(),
          desk_id = $2
        WHERE
          id = $3;
        `,
        [callerId, deskId, clientsPositionInQueuesId[0].id],
      );
    });
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
    let error: DomainError = undefined;
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
        error = new UserNotInAnyGroupError();
        return;
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
        error = new NoQueueAvaliabeError();
        return;
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
      AND queues.id = ANY($3)
      ORDER BY queues.priority DESC
      `,
        [serviceId, organizationId, queuesAssociatedWithGroupsIds],
      );

      const occurrenceOfUserInQueue = await transaction.query(
        `
      SELECT
        clients_position_in_queues.queue_id
      FROM clients_position_in_queues
      WHERE clients_position_in_queues.client_id = $1
      AND clients_position_in_queues.called_at IS NULL

      `,
        [userId],
      );

      const isUserAlreadyInQueue = occurrenceOfUserInQueue.length !== 0;

      if (!isUserAlreadyInQueue) {
        await transaction.query(
          `INSERT INTO clients_position_in_queues (client_id, queue_id) VALUES ($1, $2)`,
          [userId, queuesOrderedByPriority[0].id],
        );
      }
    });

    if (error) {
      return left(error);
    }

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
      position: position.position,
    });
  }

  async getPositionOfClient(
    queueId: string,
    registrationId: string,
  ): Promise<PositionInQueueWithDesk> {
    console.log('queueId', queueId);
    console.log('registrationId', registrationId);

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
    console.log('clientsInQueueFromDatabase', clientsInQueueFromDatabase);

    const lastClientCalledFromQueue = await this.queuesRepository.query(
      `
      SELECT 
        clients.id, 
        clients.name, 
        clients.organization_id, 
        clients.registration_id,
        clients_position_in_queues.called_at,
        clients_position_in_queues.attended_by_user,
        clients.created_at, 
        clients.updated_at,
        clients_position_in_queues.desk_id
      FROM clients
      INNER JOIN clients_position_in_queues ON clients.id = clients_position_in_queues.client_id
      WHERE clients_position_in_queues.queue_id = $1
      AND clients_position_in_queues.called_at IS NOT NULL
      ORDER BY clients_position_in_queues.called_at DESC
      LIMIT 1
      `,
      [queueId],
    );
    console.log('lastClientCalledFromQueue', lastClientCalledFromQueue);
    console.log(
      'lastClientCalledFromQueue.length',
      lastClientCalledFromQueue.length,
    );
    console.log(
      'lastClientCalledFromQueue[0].registration_id',
      lastClientCalledFromQueue[0].registration_id,
    );

    if (
      lastClientCalledFromQueue.length > 0 &&
      lastClientCalledFromQueue[0].registration_id === registrationId
    ) {
      const desk = await this.queuesRepository.query(
        `
        SELECT
          desks.id,
          desks.name,
          desks.organization_id,
          desks.created_at,
          desks.updated_at
        FROM desks
        WHERE desks.id = $1
        `,
        [lastClientCalledFromQueue[0].desk_id],
      );
      console.log('desk', desk);

      return {
        position: 0,
        desk: {
          id: desk[0].id,
          name: desk[0].name,
          organizationId: desk[0].organization_id,
          createdAt: desk[0].created_at,
          updatedAt: desk[0].updated_at,
        },
      };
    }

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
    console.log('clientsInQueue', clientsInQueue);

    const position = clientsInQueue.findIndex(
      (client) => client.registrationId === registrationId,
    );
    console.log('position', position);

    if (position === -1) {
      return {
        position: -1,
      };
    }

    return {
      position: position + 1,
    };
    // -1 -> not in queue
    //  0 -> last called client
    //  1 -> first client in queue not called
  }

  // async callNextClient(queueId: string): Promise<void> {
  //   await this.queuesRepository.manager.transaction(async (transaction) => {
  //     const firstClientFromQueue = await transaction.query(
  //       `
  //       select
  //         id
  //       FROM clients_position_in_queues
  //       WHERE queue_id = $1
  //       and called_at is null
  //       ORDER BY clients_position_in_queues.created_at ASC
  //       LIMIT 1
  //       `,
  //       [queueId],
  //     );

  //     await transaction.query(
  //       `
  //       UPDATE clients_position_in_queues
  //       SET
  //         called_at = now()
  //       WHERE
  //         id = $1;
  //       `,
  //       [firstClientFromQueue[0].id],
  //     );
  //   });
  // }

  async findById(queueId: string): Promise<QueueEntity> {
    const queue = await this.queuesRepository.findOne({
      where: { id: queueId },
    });

    if (!queue) {
      return undefined;
    }

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
    // if no groups, remove all groups from queue
    if (groupIds.length === 0) {
      await this.queuesRepository.query(
        `DELETE FROM groups_from_queues WHERE queue_id = $1`,
        [queueId],
      );
    } else {
      await this.queuesRepository.query(
        `DELETE FROM groups_from_queues WHERE queue_id = $1`,
        [queueId],
      );
      for (const groupId of groupIds) {
        await this.queuesRepository.query(
          `INSERT INTO groups_from_queues (queue_id, group_id) VALUES ($1, $2)`,
          [queueId, groupId],
        );
      }
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
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<QueueEntity> {
    const queueEntity = this.queuesRepository.create({
      name,
      description,
      code,
      organization_id: organizationId,
      service_id: serviceId,
    });

    const queueInDatabase = await this.queuesRepository.save(queueEntity);

    await this.setPriority(queueInDatabase.id);

    const queue = await this.queuesRepository.findOne({
      where: { id: queueInDatabase.id },
    });

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
