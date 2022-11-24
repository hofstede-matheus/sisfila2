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
  findOneByIdOrAllAsAdmin({
    clientId,
  }: {
    clientId?: string;
  }): Promise<ClientEntity[]> {
    throw new Error('Method not implemented.');
  }
  findOneByIdOrAllAsUser({
    organizationId,
    userId,
  }: {
    organizationId?: string;
    userId?: string;
    clientId?: string;
  }): Promise<ClientEntity[]> {
    throw new Error('Method not implemented.');
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
