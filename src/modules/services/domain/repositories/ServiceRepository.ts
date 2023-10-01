import { ServiceEntity } from '../entities/Service.entity';

export interface ServiceRepository {
  findByOrganizationId(
    organizationId: string,
    listServicesWithNoQueue: boolean,
  ): Promise<ServiceEntity[]>;
  create(
    name: string,
    guestEnrollment: boolean,
    opensAt: Date,
    closesAt: Date,
    organizationId: string,
    subscriptionToken: string,
  ): Promise<ServiceEntity>;
  findById(serviceId: string): Promise<ServiceEntity>;
  findByDeskId(deskId: string): Promise<ServiceEntity[]>;
  remove(serviceId: string): Promise<void>;
  update(
    id: string,
    name?: string,
    subscriptionToken?: string,
    guestEnrollment?: boolean,
    opensAt?: Date,
    closesAt?: Date,
    mapOfQueueIdsIndexedByPosition?: Map<number, string>,
  ): Promise<ServiceEntity>;
}

export const ServiceRepository = Symbol('ServiceRepository');
