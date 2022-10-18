import { UserEntity } from '../src/domain/entities/User.entity';
import { UserRepository } from '../src/domain/repositories/UserRepository';

export const VALID_EMAIL = 'valid@email.com';
export const INVALID_EMAIL = 'invalidemail';

export const VALID_USER = {
  name: 'valid name',
  id: 'valid_id',
  email: 'valid_email',
  password: 'valid_password',
  userType: 'TYPE_COORDINATOR',
  createdAt: new Date(),
  updatedAt: new Date(),
} as UserEntity;

export const USER_REPOSITORY_PROVIDER = {
  provide: UserRepository,
  useValue: { create: jest.fn(), findByEmail: jest.fn() } as UserRepository,
};
