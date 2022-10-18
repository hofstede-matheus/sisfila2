import { UserEntity } from '../entities/User.entity';

export interface UserRepository {
  create(user: UserEntity): Promise<string>;
}

export const UserRepository = Symbol('UserRepository');
