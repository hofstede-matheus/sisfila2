import { ClientEntity } from '../entities/Client.entity';

export interface ClientRepository {
  create(
    name: string,
    organizationId: string,
    registrationId: string,
  ): Promise<ClientEntity>;

  findByRegistrationIdFromOrganization(
    organizationId: string,
    registrationId: string,
  ): Promise<ClientEntity | undefined>;
}

export const ClientRepository = Symbol('ClientRepository');
