import { QueueEntity } from '../entities/Queue.entity';

export interface QueueRepository {
  findByServiceId(serviceid: string): Promise<QueueEntity | undefined>;
  findByOrganizationId(
    organizationId: string,
  ): Promise<QueueEntity | undefined>;
}

export const QueueRepository = Symbol('QueueRepository');
