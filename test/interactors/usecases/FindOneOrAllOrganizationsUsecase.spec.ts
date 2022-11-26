import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidIdError,
  OrganizationNotFoundError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { OrganizationRepository } from '../../../src/domain/repositories/OrganizationRepository';
import { FindOneOrAllOrganizationsUsecase } from '../../../src/interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { OrganizationEntity } from '../../../src/domain/entities/Organization.entity';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';

describe('FindOneOrAllOrganizationsUsecase', () => {
  let useCase: FindOneOrAllOrganizationsUsecase;
  let organizationRepository: OrganizationRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        FindOneOrAllOrganizationsUsecase,
      ],
    }).compile();

    useCase = module.get<FindOneOrAllOrganizationsUsecase>(
      FindOneOrAllOrganizationsUsecase,
    );
    organizationRepository = module.get<OrganizationRepository>(
      OrganizationRepository,
    );
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not be able to find an organization with invalid id', async () => {
    const response = await useCase.execute({ organizationId: 'invalid_id' });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to find an organization that does not exists', async () => {
    jest
      .spyOn(organizationRepository, 'findOneOrAllByIdAsUser')
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
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationNotFoundError());
  });

  it('should find one organization data as user', async () => {
    jest
      .spyOn(organizationRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return [
          {
            id: VALID_ORGANIZATION.id,
            name: VALID_ORGANIZATION.name,
            code: VALID_ORGANIZATION.code,
            createdAt: VALID_ORGANIZATION.createdAt,
            updatedAt: VALID_ORGANIZATION.updatedAt,
          },
        ];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      userId: VALID_USER.id,
    });

    expect(organizationRepository.findOneOrAllByIdAsUser).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity[]).length).toBe(1);
  });

  it('should find one organization data as admin', async () => {
    jest
      .spyOn(organizationRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return [
          {
            id: VALID_ORGANIZATION.id,
            name: VALID_ORGANIZATION.name,
            code: VALID_ORGANIZATION.code,
            createdAt: VALID_ORGANIZATION.createdAt,
            updatedAt: VALID_ORGANIZATION.updatedAt,
          },
        ];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      userId: VALID_USER.id,
    });

    expect(organizationRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity[]).length).toBe(1);
  });

  it('should find all organizations data as user', async () => {
    jest
      .spyOn(organizationRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return [
          {
            id: VALID_ORGANIZATION.id,
            name: VALID_ORGANIZATION.name,
            code: VALID_ORGANIZATION.code,
            createdAt: VALID_ORGANIZATION.createdAt,
            updatedAt: VALID_ORGANIZATION.updatedAt,
          },
          {
            id: VALID_ORGANIZATION.id,
            name: VALID_ORGANIZATION.name,
            code: VALID_ORGANIZATION.code,
            createdAt: VALID_ORGANIZATION.createdAt,
            updatedAt: VALID_ORGANIZATION.updatedAt,
          },
        ];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    const response = await useCase.execute({ userId: VALID_USER.id });

    expect(organizationRepository.findOneOrAllByIdAsUser).toBeCalled();

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity[]).length).toBe(2);
  });

  it('should find all organizations data as admin', async () => {
    jest
      .spyOn(organizationRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return [
          {
            id: VALID_ORGANIZATION.id,
            name: VALID_ORGANIZATION.name,
            code: VALID_ORGANIZATION.code,
            createdAt: VALID_ORGANIZATION.createdAt,
            updatedAt: VALID_ORGANIZATION.updatedAt,
          },
          {
            id: VALID_ORGANIZATION.id,
            name: VALID_ORGANIZATION.name,
            code: VALID_ORGANIZATION.code,
            createdAt: VALID_ORGANIZATION.createdAt,
            updatedAt: VALID_ORGANIZATION.updatedAt,
          },
        ];
      });

    jest
      .spyOn(userRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      });

    const response = await useCase.execute({ userId: VALID_USER.id });

    expect(organizationRepository.findOneOrAllByIdAsAdmin).toBeCalled();

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity[]).length).toBe(2);
  });
});
