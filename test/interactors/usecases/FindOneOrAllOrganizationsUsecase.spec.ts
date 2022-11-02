import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidIdError,
  OrganizationNotFoundError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
} from '../../helpers';
import { OrganizationRepository } from '../../../src/domain/repositories/OrganizationRepository';
import { FindOneOrAllOrganizationsUsecase } from '../../../src/interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { OrganizationEntity } from '../../../src/domain/entities/Organization.entity';

describe('FindOneOrAllOrganizationsUsecase', () => {
  let useCase: FindOneOrAllOrganizationsUsecase;
  let repository: OrganizationRepository;

  beforeEach(async () => {
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
    repository = module.get<OrganizationRepository>(OrganizationRepository);
  });

  it('should not be able to find an organization with invalid id', async () => {
    const response = await useCase.execute('a');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to find an organization that does not exists', async () => {
    jest.spyOn(repository, 'findOneByIdOrAll').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationNotFoundError());
  });

  it('should find one organization data', async () => {
    jest.spyOn(repository, 'findOneByIdOrAll').mockImplementation(async () => {
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

    const response = await useCase.execute(VALID_ORGANIZATION.id);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity[]).length).toBe(1);
  });

  it('should find all organizations data', async () => {
    jest.spyOn(repository, 'findOneByIdOrAll').mockImplementation(async () => {
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

    const response = await useCase.execute(VALID_ORGANIZATION.id);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity[]).length).toBe(2);
  });
});
