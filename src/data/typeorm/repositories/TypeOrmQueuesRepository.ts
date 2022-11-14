import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntity } from '../../../domain/entities/Queue.entity';
import { QueueRepository } from '../../../domain/repositories/QueueRepository';
import { Queue } from '../entities/queues';

export class TypeOrmQueuesRepository implements QueueRepository {
  constructor(
    @InjectRepository(Queue)
    private readonly queuesRepository: Repository<Queue>,
  ) {}
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
