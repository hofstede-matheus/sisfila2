import { ServiceEntity } from '../entities/Service.entity';

export interface ServiceRepository {
  findByOrganizationId(organizationId: string): Promise<ServiceEntity[]>;
  create(
    name: string,
    guestEnrollment: boolean,
    opensAt: Date,
    closesAt: Date,
    organizationId: string,
    subscriptionToken: string,
  ): Promise<string>;
  findById(serviceId: string): Promise<ServiceEntity>;
  findByDeskId(deskId: string): Promise<ServiceEntity[]>;
}

export const ServiceRepository = Symbol('ServiceRepository');