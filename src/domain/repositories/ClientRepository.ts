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

  findManyIdsByRegistrationIds(
    registrationId: string[],
  ): Promise<string[] | undefined>;

  findOneOrAllByIdAsAdmin({
    clientId,
  }: {
    clientId?: string;
  }): Promise<ClientEntity[] | undefined>;

  findOneOrAllByIdAsUser({
    organizationId,
    userId,
    clientId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<ClientEntity[] | undefined>;

  removeAsUser({
    organizationId,
    userId,
    clientId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<void>;

  removeAsAdmin({
    organizationId,
    clientId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<void>;

  attachClientToQueue(clientId: string, queueId: string): Promise<void>;
}

export const ClientRepository = Symbol('ClientRepository');
