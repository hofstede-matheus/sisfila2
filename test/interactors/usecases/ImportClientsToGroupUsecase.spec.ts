import { TestingModule, Test } from '@nestjs/testing';
import { ClientRepository } from '../../../src/modules/clients/domain/repositories/ClientRepository';
import { GroupRepository } from '../../../src/modules/groups/domain/repositories/GroupRepository';
import { ImportClientsToGroupUsecase } from '../../../src/modules/groups/interactors/usecases/ImportClientsToGroupUsecase';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_CLIENT,
  VALID_GROUP,
  VALID_ORGANIZATION,
} from '../../helpers';
import { InvalidIdError } from '../../../src/modules/common/domain/errors';

describe('ImportClientsToGroupUsecase', () => {
  let useCase: ImportClientsToGroupUsecase;
  let groupRepository: GroupRepository;
  let clientRepository: ClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        ImportClientsToGroupUsecase,
      ],
    }).compile();

    groupRepository = module.get<GroupRepository>(GroupRepository);
    clientRepository = module.get<ClientRepository>(ClientRepository);

    useCase = module.get<ImportClientsToGroupUsecase>(
      ImportClientsToGroupUsecase,
    );

    jest.clearAllMocks();
  });

  it('should not import clients to group with invalid user id', async () => {
    const response = await useCase.execute(
      'invalid id',
      VALID_GROUP.id,
      VALID_ORGANIZATION.id,
      [],
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not import clients to group with invalid group id', async () => {
    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'invalid id',
      VALID_ORGANIZATION.id,
      [],
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not import clients to group with invalid organization id', async () => {
    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      VALID_GROUP.id,
      'invalid id',
      [],
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not import clients that are duplictaed in clients array', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return undefined;
      });

    jest.spyOn(clientRepository, 'create').mockImplementation(async () => {
      return VALID_CLIENT;
    });

    jest.spyOn(clientRepository, 'update');

    jest.spyOn(groupRepository, 'removeAllClientsFromGroup');
    jest.spyOn(groupRepository, 'attachClientsToGroup');

    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      VALID_GROUP.id,
      VALID_ORGANIZATION.id,
      [
        {
          name: VALID_CLIENT.name,
          registrationId: VALID_CLIENT.registrationId,
        },
        {
          name: VALID_CLIENT.name,
          registrationId: VALID_CLIENT.registrationId,
        },
      ],
    );

    expect(response.isRight()).toBeTruthy();
    expect(clientRepository.create).toBeCalledTimes(1);
    expect(clientRepository.create).toBeCalledWith(
      VALID_CLIENT.name,
      VALID_ORGANIZATION.id,
      VALID_CLIENT.registrationId,
    );
    expect(clientRepository.update).toBeCalledTimes(0);
    expect(groupRepository.removeAllClientsFromGroup).toBeCalledWith(
      VALID_GROUP.id,
    );
    expect(groupRepository.attachClientsToGroup).toBeCalledWith(
      VALID_GROUP.id,
      [VALID_CLIENT.id],
    );
  });

  it('should not create a new client if the client is already on database but name is not changed', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return VALID_CLIENT;
      });

    jest.spyOn(clientRepository, 'create');
    jest.spyOn(clientRepository, 'update');

    jest.spyOn(groupRepository, 'removeAllClientsFromGroup');
    jest.spyOn(groupRepository, 'attachClientsToGroup');

    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      VALID_GROUP.id,
      VALID_ORGANIZATION.id,
      [
        {
          name: VALID_CLIENT.name,
          registrationId: VALID_CLIENT.registrationId,
        },
      ],
    );

    expect(response.isRight()).toBeTruthy();
    expect(clientRepository.create).toBeCalledTimes(0);
    expect(clientRepository.update).toBeCalledTimes(0);
    expect(groupRepository.removeAllClientsFromGroup).toBeCalledWith(
      VALID_GROUP.id,
    );
    expect(groupRepository.attachClientsToGroup).toBeCalledWith(
      VALID_GROUP.id,
      [VALID_CLIENT.id],
    );
  });

  it('should not create a new client if the client is already on database but name is changed', async () => {
    jest
      .spyOn(clientRepository, 'findByRegistrationIdFromOrganization')
      .mockImplementation(async () => {
        return VALID_CLIENT;
      });

    jest.spyOn(clientRepository, 'create');

    jest.spyOn(groupRepository, 'removeAllClientsFromGroup');
    jest.spyOn(groupRepository, 'attachClientsToGroup');

    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      VALID_GROUP.id,
      VALID_ORGANIZATION.id,
      [
        {
          name: 'new name',
          registrationId: VALID_CLIENT.registrationId,
        },
      ],
    );

    expect(response.isRight()).toBeTruthy();
    expect(clientRepository.create).toBeCalledTimes(0);
    expect(clientRepository.update).toBeCalledTimes(1);
    expect(clientRepository.update).toBeCalledWith(
      VALID_CLIENT.id,
      VALID_ORGANIZATION.id,
      'new name',
    );
    expect(groupRepository.removeAllClientsFromGroup).toBeCalledWith(
      VALID_GROUP.id,
    );
    expect(groupRepository.attachClientsToGroup).toBeCalledWith(
      VALID_GROUP.id,
      [VALID_CLIENT.id],
    );
  });
});
