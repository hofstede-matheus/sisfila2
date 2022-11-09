import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidIdError,
  OrganizationNotFoundError,
  UserNotFoundError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { SetUserRoleInOrganizationUsecase } from '../../../src/interactors/usecases/SetUserRoleInOrganizationUsecase';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';
import { OrganizationRepository } from '../../../src/domain/repositories/OrganizationRepository';

describe('SetUserRoleInOrganizationUsecase', () => {
  let useCase: SetUserRoleInOrganizationUsecase;
  let userRepository: UserRepository;
  let organizationRepository: OrganizationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        SetUserRoleInOrganizationUsecase,
      ],
    }).compile();

    useCase = module.get(SetUserRoleInOrganizationUsecase);
    userRepository = module.get<UserRepository>(UserRepository);
    organizationRepository = module.get<OrganizationRepository>(
      OrganizationRepository,
    );
  });

  it('should not be able to set user role with invalid user id', async () => {
    const response = await useCase.execute(
      'invalid_id',
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to set user role with invalid organization id', async () => {
    const response = await useCase.execute(
      VALID_USER.id,
      'invalid_id',
      'TYPE_ATTENDENT',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to set user role when user not exists', async () => {
    jest.spyOn(userRepository, 'findById').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute(
      VALID_USER.id,
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
    );

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new UserNotFoundError());
  });

  it('should not be able to set user role when organization not exists', async () => {
    jest.spyOn(userRepository, 'findById').mockImplementation(async () => {
      return VALID_USER;
    });

    jest
      .spyOn(organizationRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return undefined;
      });

    const response = await useCase.execute(
      VALID_USER.id,
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
    );

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationNotFoundError());
  });

  it('should be able to set user role', async () => {
    jest.spyOn(userRepository, 'findById').mockImplementation(async () => {
      return VALID_USER;
    });

    jest
      .spyOn(organizationRepository, 'findOneByIdOrAll')
      .mockImplementation(async () => {
        return [VALID_ORGANIZATION];
      });

    const response = await useCase.execute(
      VALID_USER.id,
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
    );

    expect(response.isRight()).toBeTruthy();
  });
});
