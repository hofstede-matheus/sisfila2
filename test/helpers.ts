import { randomUUID } from 'crypto';
import { UserEntity } from '../src/domain/entities/User.entity';
import { UserRepository } from '../src/domain/repositories/UserRepository';
import { AuthenticationService } from '../src/domain/services/AuthenticationService';
import { EncryptionService } from '../src/domain/services/EncryptionService';
import { OAuthService } from '../src/domain/services/OauthAuthenticationService';
import { Either } from '../src/shared/helpers/either';

// export const VALID_EMAIL = 'valid@email.com';

export function generateValidEmail() {
  return `${randomUUID()}@email.com`;
}
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

export const ALL_REPOSITORIES_PROVIDERS = [
  {
    provide: UserRepository,
    useValue: {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as UserRepository,
  },
];

export const ALL_SERVICES_PROVIDERS = [
  {
    provide: EncryptionService,
    useValue: {
      check: jest.fn(),
      encrypt: jest.fn(),
    } as EncryptionService,
  },
  {
    provide: AuthenticationService,
    useValue: {
      generate: jest.fn(),
      decrypt: jest.fn(),
    } as AuthenticationService,
  },
  {
    provide: OAuthService,
    useValue: {
      getUserProfile: jest.fn(),
    } as OAuthService,
  },
];

export const UUID_V4_REGEX_EXPRESSION =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const JWT_TOKEN_REGEX_EXPRESSION = /^(?:[\w-]*\.){2}[\w-]*$/;

export function checkForTokenAndUserId(response: any) {
  if (response.isRight()) {
    expect(response.isRight()).toBeTruthy();
    expect(
      (response.value as { token: string; user: UserEntity }).token,
    ).toBeDefined();
    expect(
      (response.value as { token: string; user: UserEntity }).user.id,
    ).toBeDefined();
  } else {
    throw new Error();
  }
}
