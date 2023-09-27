import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RolesInOrganizations,
  UserEntity,
  UserEntityTypes,
} from '../../../domain/entities/User.entity';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { Organization } from '../../../../organizations/data/typeorm/entities/organizations.typeorm-entity';
import { User } from '../entities/users.typeorm-entity';

export class TypeOrmUsersRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}

  async findAllFromOrganizationAsUser({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<UserEntity[]> {
    const users = await this.usersRepository.query(
      `
      select * from users where id in (
        select user_id from users_role_in_organizations where organization_id = $1
      )
      `,
      [organizationId],
    );

    const usersEntities: UserEntity[] = [];

    for (const user of users) {
      const rolesInOrganizations = await this.getRolesInAllOrganizations(
        user.id,
      );
      usersEntities.push({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isSuperAdmin: user.isSuperAdmin,
        rolesInOrganizations,
      });
    }

    return usersEntities;
  }

  async findOneOrAllByIdAsAdmin({
    searchedUserId,
  }: {
    searchedUserId?: string;
  }): Promise<UserEntity[]> {
    const users = await this.usersRepository.findBy({ id: searchedUserId });

    const rolesInOrganizations = await this.getRolesInAllOrganizations(
      searchedUserId,
    );

    const usersEntities: UserEntity[] = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isSuperAdmin: user.isSuperAdmin,
        rolesInOrganizations,
      };
    });

    return usersEntities;
  }

  async findOneOrAllByIdAsUser({
    organizationId,
    requestingUserId,
    searchedUserId,
  }: {
    organizationId?: string;
    requestingUserId?: string;
    searchedUserId?: string;
  }): Promise<UserEntity[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('users')
      .innerJoin(
        'users_role_in_organizations',
        'urio',
        'urio.user_id = users.id',
      )
      .innerJoin('organizations', 'orgs', 'orgs.id = urio.organization_id')

      .where('urio.user_id = :userId', { userId: requestingUserId })
      .andWhere('orgs.id = :organizationId', { organizationId });

    if (searchedUserId)
      queryBuilder.andWhere('users.id = :userId', {
        userId: searchedUserId,
      });

    const users = await queryBuilder.getMany();

    if (users.length === 0) return undefined;

    const rolesInOrganizations = await this.getRolesInAllOrganizations(
      searchedUserId,
    );

    return users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isSuperAdmin: user.isSuperAdmin,
        rolesInOrganizations,
      };
    });
  }

  async findOneByIdOrAll(id?: string): Promise<UserEntity[]> {
    const users = await this.usersRepository.findBy({ id });

    const rolesInOrganizations = await this.getRolesInAllOrganizations(id);

    const usersEntities: UserEntity[] = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isSuperAdmin: user.isSuperAdmin,
        rolesInOrganizations,
      };
    });

    return usersEntities;
  }

  async setUserRoleInOrganization(
    userId: string,
    organizationId: string,
    role: UserEntityTypes | undefined,
  ): Promise<UserEntity | undefined> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) return;

    const organization = await this.organizationsRepository.findOneBy({
      id: organizationId,
    });

    if (!organization) return;

    if (role === undefined) {
      await this.usersRepository.query(
        `
        delete from users_role_in_organizations where user_id = $1 and organization_id = $2
        `,
        [userId, organizationId],
      );
      const updatedUser = await this.findOneByIdOrAll(userId);
      return updatedUser[0];
    }

    const relation: [] = await this.usersRepository.query(
      `
      select (id) from users_role_in_organizations where user_id = $1 and organization_id = $2
      `,
      [userId, organizationId],
    );
    if (relation.length > 0) {
      await this.usersRepository.query(
        `
        update users_role_in_organizations set role = $1 where user_id = $2 and organization_id = $3
        `,
        [role, userId, organizationId],
      );
      const updatedUser = await this.findOneByIdOrAll(userId);
      return updatedUser[0];
    } else {
      await this.usersRepository.query(
        `
        insert into users_role_in_organizations (user_id, organization_id, role) values ($1, $2, $3)
        `,
        [userId, organizationId, role],
      );
      const updatedUser = await this.findOneByIdOrAll(userId);
      return updatedUser[0];
    }
  }

  async create(
    name: string,
    email: string,
    password?: string,
  ): Promise<UserEntity> {
    const userEntity = this.usersRepository.create({
      name,
      email,
      password,
    });

    const userInDatabase = await this.usersRepository.save(userEntity);

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      email: userInDatabase.email,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
      isSuperAdmin: userInDatabase.isSuperAdmin,
      rolesInOrganizations: [],
    };
  }
  async findByEmail(email: string): Promise<UserEntity> {
    const userInDatabase = await this.usersRepository.findOne({
      where: { email },
    });

    if (!userInDatabase) return undefined;

    const rolesInOrganizations = await this.getRolesInAllOrganizations(
      userInDatabase.id,
    );

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      email: userInDatabase.email,
      password: userInDatabase.password,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
      isSuperAdmin: userInDatabase.isSuperAdmin,
      rolesInOrganizations,
    };
  }

  async getRolesInAllOrganizations(
    userId: string,
  ): Promise<RolesInOrganizations[]> {
    const rolesInOrganizations = await this.usersRepository.query(
      `
      select * from users_role_in_organizations where user_id = $1
      `,
      [userId],
    );

    return rolesInOrganizations.map((roleInOrganization) => {
      return {
        organizationId: roleInOrganization.organization_id,
        role: roleInOrganization.role,
      };
    });
  }
}
