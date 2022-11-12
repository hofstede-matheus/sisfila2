import { Test, TestingModule } from '@nestjs/testing';
import { InvalidIdError } from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { SetUserRoleInOrganizationUsecase } from '../../../src/interactors/usecases/SetUserRoleInOrganizationUsecase';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';
import { UserEntityTypes } from '../../../src/domain/entities/User.entity';
import { AuthorizationService } from '../../../src/domain/services/AuthorizationService';

describe('SetUserRoleInOrganizationUsecase', () => {
  let useCase: SetUserRoleInOrganizationUsecase;
  let userRepository: UserRepository;
  let authorizationService: AuthorizationService;

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
    authorizationService =
      module.get<AuthorizationService>(AuthorizationService);
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

  it('should not be able to set user role with invalid role', async () => {
    const response = await useCase.execute(
      VALID_USER.id,
      VALID_ORGANIZATION.id,
      'invalid_type' as UserEntityTypes,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should be able to set user role', async () => {
    jest
      .spyOn(userRepository, 'setUserRoleInOrganization')
      .mockImplementation(async () => {
        return;
      });

    const response = await useCase.execute(
      VALID_USER.id,
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
    );

    expect(response.isRight()).toBeTruthy();
  });
});
