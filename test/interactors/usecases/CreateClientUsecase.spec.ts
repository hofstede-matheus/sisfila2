import { Test, TestingModule } from '@nestjs/testing';
import {
  ClientAlreadyExistsError,
  InvalidIdError,
  InvalidNameError,
} from '../../../src/modules/common/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  UUID_V4_REGEX_EXPRESSION,
  VALID_CLIENT,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { CreateClientUsecase } from '../../../src/modules/clients/interactors/usecases/CreateClientUsecase';
import { ClientRepository } from '../../../src/modules/clients/domain/repositories/ClientRepository';
import { ClientEntity } from '../../../src/modules/clients/domain/entities/Client.entity';

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
      VALID_CLIENT.name,
      VALID_ORGANIZATION.id,
      VALID_CLIENT.registrationId,
    );

    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity).id).toMatch(
      UUID_V4_REGEX_EXPRESSION,
    );
    expect((response.value as ClientEntity).name).toEqual(VALID_CLIENT.name);
    expect((response.value as ClientEntity).organizationId).toEqual(
      VALID_ORGANIZATION.id,
    );
    expect((response.value as ClientEntity).registrationId).toEqual(
      VALID_CLIENT.registrationId,
    );
  });
});
