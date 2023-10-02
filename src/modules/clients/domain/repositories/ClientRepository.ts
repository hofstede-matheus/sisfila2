import { ClientEntity } from '../entities/Client.entity';

export interface ClientRepository {
  create(
    name: string,
    organizationId: string,
    registrationId: string,
  ): Promise<ClientEntity>;

  update(
    clientId: string,
    organizationId: string,
    name: string,
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

  addTokenToClient(clientId: string, token: string): Promise<void>;
  getTokenFromClient(clientId: string): Promise<string | undefined>;
}

export const ClientRepository = Symbol('ClientRepository');
