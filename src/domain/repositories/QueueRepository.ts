import { QueueEntity } from '../entities/Queue.entity';

export interface QueueRepository {
  findByServiceId(serviceId: string): Promise<QueueEntity[] | undefined>;
  findByOrganizationId(organizationId: string): Promise<QueueEntity[]>;
  create(
    name: string,
    priority: number,
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<string>;
}

export const QueueRepository = Symbol('QueueRepository');
