import { UserEntity } from '../entities/User.entity';

export interface UserRepository {
  create(name: string, email: string, password?: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | undefined>;
}

export const UserRepository = Symbol('UserRepository');
