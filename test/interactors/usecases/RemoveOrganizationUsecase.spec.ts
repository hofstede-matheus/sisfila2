import { Test, TestingModule } from '@nestjs/testing';
import { InvalidIdError } from '../../../src/modules/common/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
} from '../../helpers';
import { OrganizationRepository } from '../../../src/modules/organizations/domain/repositories/OrganizationRepository';
import { RemoveOrganizationUsecase } from '../../../src/modules/organizations/interactors/usecases/RemoveOrganizationUsecase';

describe('UpdateOrganizationUsecase', () => {
  let useCase: RemoveOrganizationUsecase;
  let repository: OrganizationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        RemoveOrganizationUsecase,
      ],
    }).compile();

    useCase = module.get<RemoveOrganizationUsecase>(RemoveOrganizationUsecase);
    repository = module.get<OrganizationRepository>(OrganizationRepository);
  });

  it('should not remove an organization with invalid id', async () => {
    const response = await useCase.execute('a');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should remove an organization with valid data', async () => {
    jest.spyOn(repository, 'create').mockImplementation(async () => {
      return VALID_ORGANIZATION;
    });

    jest.spyOn(repository, 'remove').mockImplementation(async () => {
      return;
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id);

    expect(response.isRight()).toBeTruthy();
  });
});
