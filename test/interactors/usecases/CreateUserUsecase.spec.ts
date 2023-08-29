import { Test, TestingModule } from '@nestjs/testing';
import {
  EmailAlreadyExistsError,
  InvalidEmailError,
  InvalidNameError,
  InvalidPasswordError,
} from '../../../src/domain/errors';
import { CreateUserUsecase } from '../../../src/interactors/usecases/CreateUserUsecase';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  checkForTokenAndUserId,
  generateValidEmail,
  INVALID_EMAIL,
  VALID_USER,
} from '../../helpers';
import { UserRepository } from '../../../src/modules/users/domain/repositories/UserRepository';
import { AuthenticationService } from '../../../src/modules/users/domain/services/AuthenticationService';

describe('CreateUserUsecase', () => {
  let useCase: CreateUserUsecase;
  let repository: UserRepository;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        CreateUserUsecase,
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    useCase = module.get<CreateUserUsecase>(CreateUserUsecase);
  });

  it('should not create an user with invalid name', async () => {
    const response = await useCase.execute('a', generateValidEmail(), '123456');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidNameError());
  });

  it('should not create an user with invalid email', async () => {
    const response = await useCase.execute(
      'valid name',
      INVALID_EMAIL,
      '123456',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidEmailError());
  });

  it('should not create an user with invalid password', async () => {
    const response = await useCase.execute(
      'valid name',
      generateValidEmail(),
      '1',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidPasswordError());
  });

  it('should not create an user when email already exists', async () => {
    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return VALID_USER;
    });
    const response = await useCase.execute(
      'valid name',
      INVALID_EMAIL,
      '123456',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new EmailAlreadyExistsError());
  });

  it('should create an user with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return VALID_USER;
    });

    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return undefined;
    });

    jest.spyOn(authenticationService, 'generate').mockImplementation(() => {
      return 'valid_token';
    });

    const response = await useCase.execute(
      'valid name',
      generateValidEmail(),
      '12345678',
    );

    checkForTokenAndUserId(response);
  });
});
