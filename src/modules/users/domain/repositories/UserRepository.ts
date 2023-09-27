import { UserEntity, UserEntityTypes } from '../entities/User.entity';

export interface UserRepository {
  create(name: string, email: string, password?: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | undefined>;
  setUserRoleInOrganization(
    userId: string,
    organizationId: string,
    role: UserEntityTypes | undefined,
  ): Promise<UserEntity | undefined>;
  findOneByIdOrAll(id?: string): Promise<UserEntity[] | undefined>;
  findOneOrAllByIdAsAdmin({
    searchedUserId,
  }: {
    searchedUserId?: string;
  }): Promise<UserEntity[] | undefined>;

  findOneOrAllByIdAsUser({
    organizationId,
    requestingUserId,
    searchedUserId,
  }: {
    organizationId?: string;
    requestingUserId?: string;
    searchedUserId?: string;
  }): Promise<UserEntity[] | undefined>;

  findAllFromOrganizationAsUser({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<UserEntity[] | undefined>;
}

export const UserRepository = Symbol('UserRepository');
