import { QueueEntity } from '../entities/Queue.entity';

export interface QueueRepository {
  findByServiceId(serviceId: string): Promise<QueueEntity[] | undefined>;
  findByOrganizationId(organizationId: string): Promise<QueueEntity[]>;
  findById(queueId: string): Promise<QueueEntity>;
  create(
    name: string,
    priority: number,
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<string>;
  attachGroupsToQueue(groupIds: string[], queueId: string): Promise<void>;
  attachClientToQueue(userId: string, queueId: string): Promise<void>;
  callNextClient(queueId: string): Promise<void>;
}

export const QueueRepository = Symbol('QueueRepository');
