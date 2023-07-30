import { Test, TestingModule } from '@nestjs/testing';
import {
  OrganizationCodeAlreadyUsedError,
  InvalidCodeError,
  InvalidIdError,
  InvalidNameError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
} from '../../helpers';
import { OrganizationRepository } from '../../../src/domain/repositories/OrganizationRepository';
import { UpdateOrganizationUsecase } from '../../../src/interactors/usecases/UpdateOrganizationUsecase';

describe('UpdateOrganizationUsecase', () => {
  let useCase: UpdateOrganizationUsecase;
  let repository: OrganizationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        UpdateOrganizationUsecase,
      ],
    }).compile();

    useCase = module.get<UpdateOrganizationUsecase>(UpdateOrganizationUsecase);
    repository = module.get<OrganizationRepository>(OrganizationRepository);
  });

  it('should not update an organization with invalid id', async () => {
    const response = await useCase.execute('a', 'a', 'VALI');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not update an organization with invalid name', async () => {
    const response = await useCase.execute(VALID_ORGANIZATION.id, 'a', 'VALI');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidNameError());
  });

  it('should not update an organization with invalid code', async () => {
    const response = await useCase.execute(VALID_ORGANIZATION.id, 'aa', 'A');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCodeError());
  });

  it('should not update an organization with invalid code', async () => {
    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'aa',
      'AAAAAAAAAAA',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidCodeError());
  });

  it('should not update an user organization when code already exists', async () => {
    jest.spyOn(repository, 'findByCode').mockImplementation(async () => {
      return VALID_ORGANIZATION;
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id, 'aa', 'AAAA');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationCodeAlreadyUsedError());
  });

  it('should update an user with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return VALID_ORGANIZATION.id;
    });

    jest.spyOn(repository, 'findByCode').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id, 'aa', 'AAAA');

    expect(response.isRight()).toBeTruthy();
  });
});
