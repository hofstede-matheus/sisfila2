import { ServiceEntity } from '../entities/Service.entity';

export interface ServiceRepository {
  findByOrganizationId(
    organizationId: string,
  ): Promise<ServiceEntity | undefined>;
}

export const ServiceRepository = Symbol('ServiceRepository');
