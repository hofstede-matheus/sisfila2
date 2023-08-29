import { Test, TestingModule } from '@nestjs/testing';
import { InvalidIdError } from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { SetUserRoleInOrganizationUsecase } from '../../../src/interactors/usecases/SetUserRoleInOrganizationUsecase';
import { UserRepository } from '../../../src/modules/users/domain/repositories/UserRepository';
import { UserEntityTypes } from '../../../src/modules/users/domain/entities/User.entity';

describe('SetUserRoleInOrganizationUsecase', () => {
  let useCase: SetUserRoleInOrganizationUsecase;
  let userRepository: UserRepository;

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
  });

  it('should not be able to set user role with invalid user id', async () => {
    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
      'invalid_id',
      VALID_USER.email,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to set user role with invalid email id', async () => {
    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
      VALID_USER.id,
      'invalid_email',
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to set user role with invalid organization id', async () => {
    const response = await useCase.execute(
      'invalid_id',
      'TYPE_ATTENDENT',
      VALID_USER.id,
      VALID_USER.email,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to set user role with invalid role', async () => {
    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'invalid_type' as UserEntityTypes,
      VALID_USER.id,
      VALID_USER.email,
    );
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should be able to set user role with userId', async () => {
    jest
      .spyOn(userRepository, 'setUserRoleInOrganization')
      .mockImplementation(async () => {
        return;
      });

    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
      VALID_USER.id,
      undefined,
    );

    expect(response.isRight()).toBeTruthy();
  });

  it('should be able to set user role with userEmail', async () => {
    jest
      .spyOn(userRepository, 'setUserRoleInOrganization')
      .mockImplementation(async () => {
        return;
      });

    jest.spyOn(userRepository, 'findByEmail').mockImplementation(async () => {
      return { ...VALID_USER };
    });

    const response = await useCase.execute(
      VALID_ORGANIZATION.id,
      'TYPE_ATTENDENT',
      undefined,
      VALID_USER.email,
    );

    expect(response.isRight()).toBeTruthy();
  });
});
