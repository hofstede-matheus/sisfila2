import { Test, TestingModule } from '@nestjs/testing';
import {
  OrganizationCodeAlreadyUsedError,
  InvalidCodeError,
  InvalidNameError,
} from '../../../src/modules/common/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  UUID_V4_REGEX_EXPRESSION,
  VALID_ORGANIZATION,
  VALID_SERVICE,
  VALID_USER,
} from '../../helpers';
import { CreateOrganizationUsecase } from '../../../src/modules/organizations/interactors/usecases/CreateOrganizationUsecase';
import { OrganizationRepository } from '../../../src/modules/organizations/domain/repositories/OrganizationRepository';
import { OrganizationEntity } from '../../../src/modules/organizations/domain/entities/Organization.entity';
import { ServiceRepository } from '../../../src/modules/services/domain/repositories/ServiceRepository';

describe('CreateOrganizationUsecase', () => {
  let useCase: CreateOrganizationUsecase;
  let organizationRepository: OrganizationRepository;
  let serviceRepository: ServiceRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        CreateOrganizationUsecase,
      ],
    }).compile();

    useCase = module.get<CreateOrganizationUsecase>(CreateOrganizationUsecase);
    organizationRepository = module.get<OrganizationRepository>(
      OrganizationRepository,
    );
    serviceRepository = module.get<ServiceRepository>(ServiceRepository);
  });

  it('should not create an organization with invalid name', async () => {
    const response = await useCase.execute('a', 'VALI', VALID_USER.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidNameError());
  });

  it('should not create an organization with invalid code < 2', async () => {
    const response = await useCase.execute('aa', 'A', VALID_USER.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCodeError());
  });

  it('should not create an organization with invalid code > 10', async () => {
    const response = await useCase.execute('aa', 'AAAAAAAAAAA', VALID_USER.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCodeError());
  });

  it('should not create an user organization when code already exists', async () => {
    jest
      .spyOn(organizationRepository, 'findByCode')
      .mockImplementation(async () => {
        return VALID_ORGANIZATION;
      });

    const response = await useCase.execute('aa', 'AAAA', VALID_USER.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationCodeAlreadyUsedError());
  });

  it('should create an organization with valid data', async () => {
    jest
      .spyOn(organizationRepository, 'create')
      .mockImplementation(async () => {
        return VALID_ORGANIZATION;
      });
    jest
      .spyOn(organizationRepository, 'findByCode')
      .mockImplementation(async () => {
        return undefined;
      });
    jest.spyOn(serviceRepository, 'create').mockImplementation(async () => {
      return VALID_SERVICE;
    });

    const response = await useCase.execute(
      VALID_ORGANIZATION.name,
      VALID_ORGANIZATION.code,
      VALID_USER.id,
    );

    expect(response.isRight()).toBeTruthy();
    expect((response.value as OrganizationEntity).id).toMatch(
      UUID_V4_REGEX_EXPRESSION,
    );
    expect((response.value as OrganizationEntity).name).toEqual(
      VALID_ORGANIZATION.name,
    );
    expect((response.value as OrganizationEntity).code).toEqual(
      VALID_ORGANIZATION.code,
    );
  });
});
