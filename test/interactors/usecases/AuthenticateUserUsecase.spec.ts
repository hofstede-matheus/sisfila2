import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidPasswordError,
} from '../../../src/domain/errors';
import {
  USER_REPOSITORY_PROVIDER,
  VALID_EMAIL,
  VALID_USER,
} from '../../helpers';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';
import { AuthenticateUserUsecase } from '../../../src/interactors/usecases/AuthenticateUserUsecase';

describe('AuthenticateUserUsecase', () => {
  let useCase: AuthenticateUserUsecase;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [USER_REPOSITORY_PROVIDER, AuthenticateUserUsecase],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    useCase = module.get<AuthenticateUserUsecase>(AuthenticateUserUsecase);
  });

  it('should not authenticate user with invalid email', async () => {
    const response = await useCase.execute('invalid email', '12345678');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidEmailError());
  });

  it('should not authenticate user with invalid password', async () => {
    const response = await useCase.execute(VALID_EMAIL, '1');
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

    const response = await useCase.execute(
      VALID_USER.email,
      VALID_USER.password,
    );
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual('valid_token');
  });
});
