import { Test, TestingModule } from '@nestjs/testing';
import {
  ClientNotFoundError,
  InvalidIdError,
} from '../../../src/modules/common/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_CLIENT,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { UserRepository } from '../../../src/modules/users/domain/repositories/UserRepository';
import { FindOneOrAllClientsUsecase } from '../../../src/modules/clients/interactors/usecases/FindOneOrAllClientsUsecase';
import { ClientRepository } from '../../../src/modules/clients/domain/repositories/ClientRepository';
import { ClientEntity } from '../../../src/modules/clients/domain/entities/Client.entity';

describe('FindOneOrAllClientsUsecase', () => {
  let useCase: FindOneOrAllClientsUsecase;
  let clientRepository: ClientRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        FindOneOrAllClientsUsecase,
      ],
    }).compile();

    useCase = module.get(FindOneOrAllClientsUsecase);
    clientRepository = module.get<ClientRepository>(ClientRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not be able to find an client with invalid organization id', async () => {
    const response = await useCase.execute({
      organizationId: 'invalid_id',
      userId: VALID_USER.id,
      clientId: VALID_CLIENT.id,
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not be able to find an client with invalid user id', async () => {
    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      userId: 'invalid_id',
      clientId: VALID_CLIENT.id,
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not be able to find an client with invalid client id', async () => {
    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      userId: VALID_USER.id,
      clientId: 'invalid_id',
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not be able to find an client that does not exists as user', async () => {
    jest
      .spyOn(clientRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return undefined;
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
    });
    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity[]).length).toBe(0);
  });

  it('should not be able to find an client that does not exists as admin', async () => {
    jest
      .spyOn(clientRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return undefined;
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
    });
    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity[]).length).toBe(0);
  });

  it('should find one client data as user', async () => {
    jest
      .spyOn(clientRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return [VALID_CLIENT];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      userId: VALID_USER.id,
      clientId: VALID_CLIENT.id,
    });

    expect(clientRepository.findOneOrAllByIdAsUser).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity[]).length).toBe(1);
  });

  it('should find one client data as admin', async () => {
    jest
      .spyOn(clientRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return [VALID_CLIENT];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      });

    const response = await useCase.execute({
      clientId: VALID_CLIENT.id,
      userId: VALID_USER.id,
    });

    expect(clientRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity[]).length).toBe(1);
  });

  it('should find all client data as user', async () => {
    jest
      .spyOn(clientRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return [VALID_CLIENT, VALID_CLIENT];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    const response = await useCase.execute({ userId: VALID_USER.id });

    expect(clientRepository.findOneOrAllByIdAsUser).toBeCalled();

    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity[]).length).toBe(2);
  });

  it('should find all client data as admin', async () => {
    jest
      .spyOn(clientRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return [VALID_CLIENT, VALID_CLIENT];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      });

    const response = await useCase.execute({ userId: VALID_USER.id });

    expect(clientRepository.findOneOrAllByIdAsAdmin).toBeCalled();

    expect(response.isRight()).toBeTruthy();
    expect((response.value as ClientEntity[]).length).toBe(2);
  });
});
