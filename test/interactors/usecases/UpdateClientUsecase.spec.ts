import { TestingModule, Test } from '@nestjs/testing';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_CLIENT,
  VALID_ORGANIZATION,
} from '../../helpers';
import {
  InvalidIdError,
  InvalidNameError,
} from '../../../src/modules/common/domain/errors';
import { UpdateClientUsecase } from '../../../src/modules/clients/interactors/usecases/UpdateClientUsecase';
import { ClientRepository } from '../../../src/modules/clients/domain/repositories/ClientRepository';

describe('UpdateClientUsecase', () => {
  let useCase: UpdateClientUsecase;
  let clientRepository: ClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        UpdateClientUsecase,
      ],
    }).compile();

    useCase = module.get<UpdateClientUsecase>(UpdateClientUsecase);
    clientRepository = module.get<ClientRepository>(ClientRepository);
  });

  it('should not update client if clientId is invalid', async () => {
    const response = await useCase.execute(
      '123',
      VALID_ORGANIZATION.id,
      VALID_CLIENT.name,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not update client if organizationId is invalid', async () => {
    const response = await useCase.execute(
      VALID_CLIENT.id,
      '123',
      VALID_CLIENT.name,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not update client if name is invalid', async () => {
    const response = await useCase.execute(
      VALID_CLIENT.id,
      VALID_ORGANIZATION.id,
      '',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidNameError);
  });

  it('should update client', async () => {
    jest.spyOn(clientRepository, 'update').mockImplementation(async () => {
      return VALID_CLIENT;
    });

    const response = await useCase.execute(
      VALID_CLIENT.id,
      VALID_ORGANIZATION.id,
      VALID_CLIENT.name,
    );
    expect(response.isRight()).toBeTruthy();
  });
});
