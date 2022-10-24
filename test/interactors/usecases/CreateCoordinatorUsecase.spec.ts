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
  INVALID_EMAIL,
  VALID_EMAIL,
  VALID_USER,
} from '../../helpers';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';

describe('CreateCoordinatorUsecase', () => {
  let useCase: CreateUserUsecase;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        CreateUserUsecase,
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    useCase = module.get<CreateUserUsecase>(CreateUserUsecase);
  });

  it('shoud not create an user with invalid name', async () => {
    const response = await useCase.execute('a', VALID_EMAIL, '123456');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidNameError());
  });

  it('shoud not create an user with invalid email', async () => {
    const response = await useCase.execute(
      'valid name',
      INVALID_EMAIL,
      '123456',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidEmailError());
  });

  it('shoud not create an user with invalid password', async () => {
    const response = await useCase.execute('valid name', VALID_EMAIL, '1');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidPasswordError());
  });

  it('shoud not create an user when email already exists', async () => {
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

  it('shoud create an user with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return 'valid_token';
    });

    jest.spyOn(repository, 'findByEmail').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute(
      'valid name',
      VALID_EMAIL,
      '12345678',
    );
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual('valid_token');
  });
});
