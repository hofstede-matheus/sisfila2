import { UserEntity } from '../src/domain/entities/User.entity';
import { UserRepository } from '../src/domain/repositories/UserRepository';
import { AuthenticationService } from '../src/domain/services/AuthenticationService';
import { EncryptionService } from '../src/domain/services/EncryptionService';

export const VALID_EMAIL = 'valid@email.com';
export const INVALID_EMAIL = 'invalidemail';

export const VALID_USER = {
  name: 'Valid Name',
  id: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
  email: 'valid@email.com',
  password: '12345678',
  userType: 'TYPE_COORDINATOR',
  createdAt: new Date(),
  updatedAt: new Date(),
} as UserEntity;

export const USER_REPOSITORY_PROVIDER = {
  provide: UserRepository,
  useValue: { create: jest.fn(), findByEmail: jest.fn() } as UserRepository,
};

export const ENCRYPTATION_SERVICE_PROVIDER = {
  provide: EncryptionService,
  useValue: { check: jest.fn(), encrypt: jest.fn() } as EncryptionService,
};

export const AUTHENTICATION_SERVICE_PROVIDER = {
  provide: AuthenticationService,
  useValue: {
    generate: jest.fn(),
    decrypt: jest.fn(),
  } as AuthenticationService,
};
