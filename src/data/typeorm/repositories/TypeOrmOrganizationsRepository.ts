import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../../../domain/entities/Organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/OrganizationRepository';
import { Organization } from '../entities/organizations';

export class TypeOrmOrganizationsRepository implements OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}

  remove(id: string): Promise<void> {
    this.organizationsRepository.delete(id);
    return;
  }

  async findOneByIdOrAll(id?: string): Promise<OrganizationEntity[]> {
    const organizations = await this.organizationsRepository.findBy({ id });

    const organizationsEntity = organizations.map((organization) => {
      return {
        id: organization.id,
        name: organization.name,
        code: organization.code,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };
    });

    return organizationsEntity;
  }
  async update(id: string, name?: string, code?: string): Promise<void> {
    await this.organizationsRepository.update(id, {
      name,
      code,
    });

    return;
  }

  async create(name: string, code: string): Promise<string> {
    const userEntity = this.organizationsRepository.create({
      name,
      code,
    });

    const userInDatabase = await this.organizationsRepository.save(userEntity);

    return userInDatabase.id;
  }
  async findByCode(code: string): Promise<OrganizationEntity> {
    const userInDatabase = await this.organizationsRepository.findOne({
      where: { code },
    });

    if (!userInDatabase) return undefined;

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      code: userInDatabase.code,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
    };
  }
}
