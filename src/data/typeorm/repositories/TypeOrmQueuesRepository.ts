import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClientInQueue,
  QueueEntity,
} from '../../../domain/entities/Queue.entity';
import { QueueRepository } from '../../../domain/repositories/QueueRepository';
import { Queue } from '../entities/queues';

export class TypeOrmQueuesRepository implements QueueRepository {
  constructor(
    @InjectRepository(Queue)
    private readonly queuesRepository: Repository<Queue>,
  ) {}

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
        clients.created_at, 
        clients.updated_at
      FROM clients
      INNER JOIN clients_position_in_queues ON clients.id = clients_position_in_queues.client_id
      WHERE clients_position_in_queues.queue_id = $1
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
          createdAt: client.created_at,
          updatedAt: client.updated_at,
        };
      },
    );

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

    const mappedQueues: QueueEntity[] = queues.map((queue: Queue) => {
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
      };
    });

    return mappedQueues;
  }

  async create(
    name: string,
    priority: number,
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<string> {
    const queueEntity = this.queuesRepository.create({
      name,
      description,
      code,
      priority,
      organization_id: organizationId,
      service_id: serviceId,
    });

    const queueInDatabase = await this.queuesRepository.save(queueEntity);

    return queueInDatabase.id;
  }

  async findByServiceId(serviceId: string): Promise<QueueEntity[]> {
    const queues = await this.queuesRepository.find({
      where: { service_id: serviceId },
    });

    const mappedQueues: QueueEntity[] = queues.map((queue: Queue) => {
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
      };
    });

    return mappedQueues;
  }
}
