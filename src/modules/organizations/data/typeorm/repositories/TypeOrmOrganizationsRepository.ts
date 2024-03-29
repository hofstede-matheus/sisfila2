import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../../../domain/entities/Organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/OrganizationRepository';
import { Organization } from '../entities/organizations.typeorm-entity';

export class TypeOrmOrganizationsRepository implements OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}
  async checkIfUserIsFromOrganization(
    organizationId: string,
    userId: string,
  ): Promise<boolean> {
    const user = await this.organizationsRepository.query(
      `
      SELECT id
      FROM users_role_in_organizations
      WHERE user_id = $1
      AND organization_id = $2
    `,
      [userId, organizationId],
    );

    return user.length === 1;
  }

  async findOneOrAllByIdAsAdmin({
    organizationId,
  }: {
    organizationId?: string;
  }): Promise<OrganizationEntity[]> {
    const organizations = await this.organizationsRepository.findBy({
      id: organizationId,
    });

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

  async findOneOrAllByIdAsUser({
    organizationId,
    userId,
  }: {
    organizationId?: string;
    userId?: string;
  }): Promise<OrganizationEntity[]> {
    const queryBuilder = this.organizationsRepository
      .createQueryBuilder('organizations')
      .innerJoin(
        'users_role_in_organizations',
        'urio',
        'urio.organization_id = organizations.id',
      )
      .where('urio.user_id = :userId', { userId });

    if (organizationId)
      queryBuilder.where('urio.organization_id = :organizationId', {
        organizationId,
      });

    const organizations = await queryBuilder.getMany();

    return organizations.map((organization) => {
      return {
        id: organization.id,
        name: organization.name,
        code: organization.code,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };
    });
  }

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
  async update(
    id: string,
    name?: string,
    code?: string,
  ): Promise<OrganizationEntity> {
    const updatedOrganization = await this.organizationsRepository.save({
      id,
      name,
      code,
    });

    return updatedOrganization;
  }

  async create(name: string, code: string): Promise<OrganizationEntity> {
    const userEntity = this.organizationsRepository.create({
      name,
      code,
    });

    const userInDatabase = await this.organizationsRepository.save(userEntity);

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      code: userInDatabase.code,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
    };
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
