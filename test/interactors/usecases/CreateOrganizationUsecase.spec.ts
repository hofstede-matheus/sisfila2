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
  VALID_USER,
} from '../../helpers';
import { CreateOrganizationUsecase } from '../../../src/modules/organizations/interactors/usecases/CreateOrganizationUsecase';
import { OrganizationRepository } from '../../../src/modules/organizations/domain/repositories/OrganizationRepository';

describe('CreateOrganizationUsecase', () => {
  let useCase: CreateOrganizationUsecase;
  let repository: OrganizationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        CreateOrganizationUsecase,
      ],
    }).compile();

    useCase = module.get<CreateOrganizationUsecase>(CreateOrganizationUsecase);
    repository = module.get<OrganizationRepository>(OrganizationRepository);
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
    jest.spyOn(repository, 'findByCode').mockImplementation(async () => {
      return VALID_ORGANIZATION;
    });

    const response = await useCase.execute('aa', 'AAAA', VALID_USER.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationCodeAlreadyUsedError());
  });

  it('should create an organization with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return VALID_ORGANIZATION.id;
    });

    jest.spyOn(repository, 'findByCode').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute('aa', 'AAAA', VALID_USER.id);

    expect(response.isRight()).toBeTruthy();
    expect(response.value).toMatch(UUID_V4_REGEX_EXPRESSION);
  });
});
