import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserEntity,
  UserEntityTypes,
} from '../../../domain/entities/User.entity';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { Organization } from '../entities/organizations';
import { User } from '../entities/users';

export class TypeOrmUsersRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}
  async findOneByIdOrAll(id?: string): Promise<UserEntity[]> {
    const users = await this.usersRepository.findBy({ id });

    const rolesFromUserInOrganizations: [] = await this.usersRepository.query(
      `
      select * 
      from users_role_in_organizations
      inner join organizations on users_role_in_organizations.organization_id = organizations.id
      where user_id = $1
      `,
      [id],
    );

    const usersEntities: UserEntity[] = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        userRolesOnOrganizationsMap: rolesFromUserInOrganizations.map(
          (role: { organization_id: string; role: string; name: string }) => {
            return {
              organizationId: role.organization_id,
              organizationName: role.name,
              role: role.role as UserEntityTypes,
            };
          },
        ),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    return usersEntities;
  }

  async setUserRoleInOrganization(
    userId: string,
    organizationId: string,
    role: UserEntityTypes | undefined,
  ): Promise<void> {
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
      return;
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
      return;
    } else {
      await this.usersRepository.query(
        `
        insert into users_role_in_organizations (user_id, organization_id, role) values ($1, $2, $3)
        `,
        [userId, organizationId, role],
      );
      return;
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
    };
  }
  async findByEmail(email: string): Promise<UserEntity> {
    const userInDatabase = await this.usersRepository.findOne({
      where: { email },
    });

    if (!userInDatabase) return undefined;

    return {
      id: userInDatabase.id,
      name: userInDatabase.name,
      email: userInDatabase.email,
      password: userInDatabase.password,
      createdAt: userInDatabase.createdAt,
      updatedAt: userInDatabase.updatedAt,
    };
  }
}
