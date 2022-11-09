import { UserEntity, UserEntityTypes } from '../entities/User.entity';

export interface UserRepository {
  create(name: string, email: string, password?: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | undefined>;
  findById(id: string): Promise<UserEntity | undefined>;
  setUserRoleInOrganization(
    userId: string,
    organizationId: string,
    role: UserEntityTypes | undefined,
  ): Promise<void>;
}

export const UserRepository = Symbol('UserRepository');
