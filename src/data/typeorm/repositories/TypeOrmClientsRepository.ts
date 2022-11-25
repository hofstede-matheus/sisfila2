import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../../domain/entities/Client.entity';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { Client } from '../entities/clients';

export class TypeOrmClientsRepository implements ClientRepository {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}
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

  async findOneByIdOrAllAsAdmin({
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
  async findOneByIdOrAllAsUser({
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
