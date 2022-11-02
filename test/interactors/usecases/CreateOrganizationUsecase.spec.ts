import { Test, TestingModule } from '@nestjs/testing';
import {
  CodeAlreadyExistsError,
  InvalidCodeError,
  InvalidNameError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  UUID_V4_REGEX_EXPRESSION,
  VALID_ORGANIZATION,
} from '../../helpers';
import { CreateOrganizationUsecase } from '../../../src/interactors/usecases/CreateOrganizationUsecase';
import { OrganizationRepository } from '../../../src/domain/repositories/OrganizationRepository';

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

  it('shoud not create an organization with invalid name', async () => {
    const response = await useCase.execute('a', 'VALI');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidNameError());
  });

  it('shoud not create an organization with invalid code', async () => {
    const response = await useCase.execute('aa', 'A');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCodeError());
  });

  it('shoud not create an organization with invalid code', async () => {
    const response = await useCase.execute('aa', 'AAAAAAAA');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCodeError());
  });

  it('shoud not create an user organization when code already exists', async () => {
    jest.spyOn(repository, 'findByCode').mockImplementation(async () => {
      return VALID_ORGANIZATION;
    });

    const response = await useCase.execute('aa', 'AAAA');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new CodeAlreadyExistsError());
  });

  it('shoud create an user with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return VALID_ORGANIZATION.id;
    });

    jest.spyOn(repository, 'findByCode').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute('aa', 'AAAA');

    expect(response.isRight()).toBeTruthy();
    expect(response.value).toMatch(UUID_V4_REGEX_EXPRESSION);
  });
});
