import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../../domain/entities/Client.entity';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { Client } from '../entities/clients.typeorm-entity';

export class TypeOrmClientsRepository implements ClientRepository {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async getTokenFromClient(clientId: string): Promise<string> {
    const token = await this.clientsRepository.query(
      `
      select fcm_token from fcm_tokens where client_id = $1
      `,
      [clientId],
    );

    if (token.length === 0) return undefined;

    return token[0].fcm_token;
  }

  async addTokenToClient(clientId: string, token: string): Promise<void> {
    const clientToken = await this.clientsRepository.query(
      `
      select * from fcm_tokens where client_id = $1 and fcm_token = $2
      `,
      [clientId, token],
    );

    if (clientToken.length !== 0) return;

    await this.clientsRepository.query(
      `
      insert into fcm_tokens (client_id, fcm_token) values ($1, $2)
      `,
      [clientId, token],
    );

    return;
  }

  async update(
    clientId: string,
    organizationId: string,
    name: string,
  ): Promise<ClientEntity> {
    const client = await this.clientsRepository.findOneBy({
      id: clientId,
      organizationId,
    });

    if (!client) return undefined;

    const updatedClient = await this.clientsRepository.save({
      id: clientId,
      organizationId,
      name,
    });

    return {
      id: updatedClient.id,
      name: updatedClient.name,
      organizationId: updatedClient.organizationId,
      registrationId: updatedClient.registrationId,
      createdAt: updatedClient.createdAt,
      updatedAt: updatedClient.updatedAt,
    };
  }

  async findManyIdsByRegistrationIds(
    registrationId: string[],
  ): Promise<string[]> {
    const clientsFromDatabase = await this.clientsRepository.query(
      `
      select id from clients where registration_id = ANY($1)
      `,
      [registrationId],
    );
    const mappedClients = clientsFromDatabase.map((client) => {
      return client.id;
    });

    return mappedClients;
  }
  async removeAsAdmin({
    organizationId,
    clientId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<void> {
    const queryBuilder = this.clientsRepository
      .createQueryBuilder('clients')
      .innerJoin('organizations', 'orgs', 'orgs.id = clients.organization_id')
      .innerJoin(
        'users_role_in_organizations',
        'urio',
        'urio.organization_id = orgs.id',
      )
      .where('orgs.id = :organizationId', { organizationId });

    queryBuilder.andWhere('clients.id = :clientId', {
      clientId,
    });

    const client = await queryBuilder.getOne();

    if (client)
      this.clientsRepository
        .createQueryBuilder('clients')
        .delete()
        .where('clients.id = :clientId', { clientId: client.id })
        .execute();
  }

  async removeAsUser({
    organizationId,
    userId,
    clientId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<void> {
    const queryBuilder = this.clientsRepository
      .createQueryBuilder('clients')
      .innerJoin('organizations', 'orgs', 'orgs.id = clients.organization_id')
      .innerJoin(
        'users_role_in_organizations',
        'urio',
        'urio.organization_id = orgs.id',
      )
      .where('urio.user_id = :userId', { userId })
      .andWhere('orgs.id = :organizationId', { organizationId });

    queryBuilder.andWhere('clients.id = :clientId', {
      clientId,
    });

    const client = await queryBuilder.getOne();

    if (client)
      this.clientsRepository
        .createQueryBuilder('clients')
        .delete()
        .where('clients.id = :clientId', { clientId: client.id })
        .execute();
  }

  async findOneOrAllByIdAsAdmin({
    clientId,
  }: {
    clientId?: string;
  }): Promise<ClientEntity[]> {
    const queryBuilder = this.clientsRepository
      .createQueryBuilder('clients')
      .innerJoin('organizations', 'orgs', 'orgs.id = clients.organization_id')
      .innerJoin(
        'users_role_in_organizations',
        'urio',
        'urio.organization_id = orgs.id',
      );

    if (clientId)
      queryBuilder.where('clients.id = :clientId', {
        clientId,
      });

    const clients = await queryBuilder.getMany();

    if (clients.length === 0) return undefined;

    return clients.map((client) => {
      return {
        id: client.id,
        name: client.name,
        organizationId: client.organizationId,
        registrationId: client.registrationId,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };
    });
  }
  async findOneOrAllByIdAsUser({
    organizationId,
    userId,
    clientId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<ClientEntity[]> {
    const queryBuilder = this.clientsRepository
      .createQueryBuilder('clients')
      .innerJoin('organizations', 'orgs', 'orgs.id = clients.organization_id')
      .innerJoin(
        'users_role_in_organizations',
        'urio',
        'urio.organization_id = orgs.id',
      )
      .where('urio.user_id = :userId', { userId })
      .andWhere('orgs.id = :organizationId', { organizationId });

    if (clientId)
      queryBuilder.andWhere('clients.id = :clientId', {
        clientId,
      });

    const clients = await queryBuilder.getMany();

    if (clients.length === 0) return undefined;

    return clients.map((client) => {
      return {
        id: client.id,
        name: client.name,
        organizationId: client.organizationId,
        registrationId: client.registrationId,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };
    });
  }

  async create(
    name: string,
    organizationId: string,
    registrationId: string,
  ): Promise<ClientEntity> {
    const client = await this.clientsRepository.create({
      name,
      organizationId,
      registrationId,
    });

    await this.clientsRepository.save(client);

    return {
      id: client.id,
      name: client.name,
      organizationId: client.organizationId,
      registrationId: client.registrationId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
  async findByRegistrationIdFromOrganization(
    organizationId: string,
    registrationId: string,
  ): Promise<ClientEntity> {
    const client = await this.clientsRepository.findOneBy({
      organizationId,
      registrationId,
    });

    if (!client) return undefined;

    return {
      id: client.id,
      name: client.name,
      organizationId: client.organizationId,
      registrationId: client.registrationId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
