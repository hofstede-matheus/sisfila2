import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidPasswordError,
} from '../../../src/modules/common/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  generateValidEmail,
  VALID_USER,
  checkForTokenAndUserId,
} from '../../helpers';
import { UserRepository } from '../../../src/modules/users/domain/repositories/UserRepository';
import { AuthenticateUserUsecase } from '../../../src/modules/users/interactors/usecases/AuthenticateUserUsecase';
import { AuthenticationService } from '../../../src/modules/common/domain/services/AuthenticationService';
import { EncryptionService } from '../../../src/modules/users/domain/services/EncryptionService';

describe('AuthenticateUserUsecase', () => {
  let useCase: AuthenticateUserUsecase;
  let repository: UserRepository;
  let encryptionService: EncryptionService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        AuthenticateUserUsecase,
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    useCase = module.get<AuthenticateUserUsecase>(AuthenticateUserUsecase);
  });

  it('should not authenticate user with invalid email', async () => {
    const response = await useCase.execute('invalid email', '12345678');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidEmailError());
  });

  it('should not authenticate user with invalid password', async () => {
    const response = await useCase.execute(generateValidEmail(), '1');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidPasswordError());
  });

  it('should not authenticate user with wrong email', async () => {
    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute(
      VALID_USER.email,
      VALID_USER.password,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCredentialsError());
  });

  it('should not authenticate user with wrong password', async () => {
    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return VALID_USER;
    });

    jest.spyOn(encryptionService, 'check').mockImplementation(async () => {
      return false;
    });

    const response = await useCase.execute(
      VALID_USER.email,
      'another_password',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCredentialsError());
  });

  it('should authenticate user with valid credentials', async () => {
    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return VALID_USER;
    });

    jest.spyOn(encryptionService, 'check').mockImplementation(async () => {
      return true;
    });

    jest.spyOn(authenticationService, 'generate').mockImplementation(() => {
      return 'valid_token';
    });

    const response = await useCase.execute(
      VALID_USER.email,
      VALID_USER.password,
    );

    checkForTokenAndUserId(response);
  });
});
