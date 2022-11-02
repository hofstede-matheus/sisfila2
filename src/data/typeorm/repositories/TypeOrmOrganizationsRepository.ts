import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../../../domain/entities/Organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/OrganizationRepository';
import { Organization } from '../entities/organizations';

export class TypeOrmOrganizationsRepository implements OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  findOneByIdOrAll(id?: string): Promise<OrganizationEntity[]> {
    throw new Error('Method not implemented.');
  }
  async update(id: string, name?: string, code?: string): Promise<void> {
    await this.organizationRepository.update(id, {
      name,
      code,
    });

    return;
  }

  async create(name: string, code: string): Promise<string> {
    const userEntity = this.organizationRepository.create({
      name,
      code,
    });

    const userInDatabase = await this.organizationRepository.save(userEntity);

    return userInDatabase.id;
  }
  async findByCode(code: string): Promise<OrganizationEntity> {
    const userInDatabase = await this.organizationRepository.findOne({
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
