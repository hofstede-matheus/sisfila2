import { Test, TestingModule } from '@nestjs/testing';
import {
  ClientAlreadyExistsError,
  InvalidIdError,
  InvalidNameError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  UUID_V4_REGEX_EXPRESSION,
  VALID_CLIENT,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { CreateClientUsecase } from '../../../src/interactors/usecases/CreateClientUsecase';
import { ClientRepository } from '../../../src/domain/repositories/ClientRepository';

describe('CreateClientUsecase', () => {
  let useCase: CreateClientUsecase;
  let clientRepository: ClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        CreateClientUsecase,
      ],
    }).compile();

    clientRepository = module.get<ClientRepository>(ClientRepository);

    useCase = module.get(CreateClientUsecase);
  });

  it('should not create an client with invalid name', async () => {
    const response = await useCase.execute(
      'a',
      VALID_ORGANIZATION.id,
      '123456',
    );

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidNameError);
  });

  it('should not create an client with invalid organization id', async () => {
    const response = await useCase.execute(
      VALID_USER.name,
      'invalid_id',
      '123456',
    );

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not create an client with invalid registration id', async () => {
    const response = await useCase.execute(
      VALID_USER.name,
      VALID_ORGANIZATION.id,
      'a',
    );

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not create an client when registration id already exists in organization', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return VALID_CLIENT;
      });

    const response = await useCase.execute(
      VALID_USER.name,
      VALID_ORGANIZATION.id,
      '123456',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(ClientAlreadyExistsError);
  });

  it('should client an user with valid data', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return undefined;
      });

    jest.spyOn(clientRepository, 'create').mockImplementation(async () => {
      return VALID_CLIENT;
    });

    const response = await useCase.execute(
      VALID_USER.name,
      VALID_ORGANIZATION.id,
      '123456',
    );

    expect(response.isRight()).toBeTruthy();
    expect(response.value).toMatch(UUID_V4_REGEX_EXPRESSION);
  });
});
