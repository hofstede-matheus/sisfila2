import { Test, TestingModule } from '@nestjs/testing';
import { InvalidIdError } from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_CLIENT,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { RemoveClientUsecase } from '../../../src/interactors/usecases/RemoveClientUsecase';
import { ClientRepository } from '../../../src/domain/repositories/ClientRepository';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';

describe('RemoveClientUsecase', () => {
  let useCase: RemoveClientUsecase;
  let clientRepository: ClientRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        RemoveClientUsecase,
      ],
    }).compile();

    useCase = module.get(RemoveClientUsecase);
    clientRepository = module.get<ClientRepository>(ClientRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  it('should not remove client with invalid client id', async () => {
    const response = await useCase.execute({
      clientId: 'invalid_id',
      userId: VALID_USER.id,
      organizationId: VALID_ORGANIZATION.id,
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not remove client with invalid id', async () => {
    const response = await useCase.execute({
      clientId: VALID_CLIENT.id,
      userId: 'invalid_id',
      organizationId: VALID_ORGANIZATION.id,
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not remove client with invalid id', async () => {
    const response = await useCase.execute({
      clientId: VALID_CLIENT.id,
      userId: VALID_USER.id,
      organizationId: 'invalid_id',
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should remove client with valid data as user', async () => {
    jest
      .spyOn(clientRepository, 'removeAsUser')
      .mockImplementation(async () => {
        return;
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    const response = await useCase.execute({
      clientId: VALID_CLIENT.id,
      userId: VALID_USER.id,
      organizationId: VALID_ORGANIZATION.id,
    });

    expect(userRepository.findOneByIdOrAll).toBeCalledTimes(1);
    expect(clientRepository.removeAsUser).toBeCalledTimes(1);
    expect(clientRepository.removeAsAdmin).toBeCalledTimes(0);

    expect(response.isRight()).toBeTruthy();
  });

  it('should remove client with valid data as admin', async () => {
    jest
      .spyOn(clientRepository, 'removeAsUser')
      .mockImplementation(async () => {
        return;
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      });

    const response = await useCase.execute({
      clientId: VALID_CLIENT.id,
      userId: VALID_USER.id,
      organizationId: VALID_ORGANIZATION.id,
    });

    expect(userRepository.findOneByIdOrAll).toBeCalledTimes(1);
    expect(clientRepository.removeAsUser).toBeCalledTimes(0);
    expect(clientRepository.removeAsAdmin).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
  });
});
