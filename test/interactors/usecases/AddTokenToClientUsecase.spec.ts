import { TestingModule, Test } from '@nestjs/testing';
import { ClientRepository } from '../../../src/modules/clients/domain/repositories/ClientRepository';
import { AddTokenToClientUsecase } from '../../../src/modules/clients/interactors/usecases/AddTokenToClientUsecase';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_CLIENT,
  VALID_ORGANIZATION,
} from '../../helpers';
import {
  ClientNotFoundError,
  InvalidIdError,
} from '../../../src/modules/common/domain/errors';

describe('AddTokenToClientUsecase', () => {
  let useCase: AddTokenToClientUsecase;
  let clientRepository: ClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        AddTokenToClientUsecase,
      ],
    }).compile();

    useCase = module.get<AddTokenToClientUsecase>(AddTokenToClientUsecase);
    clientRepository = module.get<ClientRepository>(ClientRepository);
  });

  it('should not add token to client with invalid organizationId', async () => {
    const response = await useCase.execute('123', '123', '123');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not add token to client when client does not exists', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return undefined;
      });

    const response = await useCase.execute('123', VALID_ORGANIZATION.id, '123');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(ClientNotFoundError);
  });

  it('should add token to client', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return VALID_CLIENT;
      });

    jest
      .spyOn(clientRepository, 'addTokenToClient')
      .mockImplementation(async () => {
        return;
      });

    const response = await useCase.execute('123', VALID_ORGANIZATION.id, '123');
    expect(response.isRight()).toBeTruthy();
  });
});
