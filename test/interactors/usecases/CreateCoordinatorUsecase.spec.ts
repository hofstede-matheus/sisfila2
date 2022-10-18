import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidEmailError,
  InvalidNameError,
  InvalidPasswordError,
  InvalidUserTypeError,
} from '../../../src/domain/errors';
import { CreateCoordinatorUsecase } from '../../../src/interactors/usecases/CreateCoordinatorUsecase';
import { INVALID_EMAIL, VALID_EMAIL } from '../../helpers';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';

describe('CreateCoordinatorUsecase', () => {
  let useCase: CreateCoordinatorUsecase;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: { create: jest.fn() } },
        CreateCoordinatorUsecase,
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    useCase = module.get<CreateCoordinatorUsecase>(CreateCoordinatorUsecase);
  });

  it('shoud not create an user with invalid name', async () => {
    const response = await useCase.execute(
      'a',
      VALID_EMAIL,
      '123456',
      'TYPE_COORDINATOR',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidNameError());
  });

  it('shoud not create an user with invalid email', async () => {
    const response = await useCase.execute(
      'valid name',
      INVALID_EMAIL,
      '123456',
      'TYPE_COORDINATOR',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidEmailError());
  });

  it('shoud not create an user with invalid password', async () => {
    const response = await useCase.execute(
      'valid name',
      VALID_EMAIL,
      '1',
      'TYPE_COORDINATOR',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidPasswordError());
  });

  it('shoud not create an user with invalid type', async () => {
    const response = await useCase.execute(
      'valid name',
      VALID_EMAIL,
      '12345678',
      'invalid type',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidUserTypeError());
  });

  it('shoud create an user with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return 'valid_token';
    });

    const response = await useCase.execute(
      'valid name',
      VALID_EMAIL,
      '12345678',
      'TYPE_COORDINATOR',
    );
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual('valid_token');
  });
});
