import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidIdError,
  UserNotFoundError,
} from '../../../src/modules/common/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { FindOneUserUsecase } from '../../../src/modules/users/interactors/usecases/FindOneUserUsecase';
import { UserRepository } from '../../../src/modules/users/domain/repositories/UserRepository';
import { UserEntity } from '../../../src/modules/users/domain/entities/User.entity';

describe('FindOneOrAllUsersUsecase', () => {
  let useCase: FindOneUserUsecase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        FindOneUserUsecase,
      ],
    }).compile();

    useCase = module.get(FindOneUserUsecase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not be able to find an user with invalid organization id', async () => {
    const response = await useCase.execute({
      organizationId: 'invalid_id',
      requestingUserId: VALID_USER.id,
      searchedUserId: VALID_USER.id,
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not be able to find an user with invalid user id', async () => {
    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      requestingUserId: 'invalid_id',
      searchedUserId: VALID_USER.id,
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not be able to find an user with invalid user to search id', async () => {
    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      requestingUserId: VALID_USER.id,
      searchedUserId: 'invalid_id',
    });
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should not be able to find an user that does not exists as user', async () => {
    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementationOnce(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsUser')
      .mockImplementationOnce(async () => {
        return undefined;
      });

    const response = await useCase.execute({
      searchedUserId: VALID_USER.id,
      requestingUserId: VALID_USER.id,
    });

    expect(userRepository.findOneOrAllByIdAsUser).toBeCalledTimes(1);
    expect(userRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(1);

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not be able to find an user that does not exists as admin', async () => {
    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementationOnce(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      })
      .mockImplementationOnce(async () => {
        return undefined;
      });

    const response = await useCase.execute({
      searchedUserId: VALID_USER.id,
      requestingUserId: VALID_USER.id,
    });

    expect(userRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(2);

    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should find one user data as user', async () => {
    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return [VALID_USER];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      requestingUserId: VALID_USER.id,
      searchedUserId: VALID_USER.id,
    });

    expect(userRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(1);
    expect(userRepository.findOneOrAllByIdAsUser).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as UserEntity[]).length).toBe(1);
  });

  it('should find one user data as admin', async () => {
    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementationOnce(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      })
      .mockImplementationOnce(async () => {
        return [VALID_USER];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      requestingUserId: VALID_USER.id,
      searchedUserId: VALID_USER.id,
    });

    expect(userRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(2);
    expect(userRepository.findOneOrAllByIdAsUser).toBeCalledTimes(0);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as UserEntity[]).length).toBe(1);
  });

  it('should find all users data as user', async () => {
    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementation(async () => {
        return [{ ...VALID_USER, isSuperAdmin: false }];
      });

    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsUser')
      .mockImplementation(async () => {
        return [VALID_USER, VALID_USER];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      requestingUserId: VALID_USER.id,
      searchedUserId: VALID_USER.id,
    });

    expect(userRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(1);
    expect(userRepository.findOneOrAllByIdAsUser).toBeCalledTimes(1);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as UserEntity[]).length).toBe(2);
  });

  it('should find all user data as admin', async () => {
    jest
      .spyOn(userRepository, 'findOneOrAllByIdAsAdmin')
      .mockImplementationOnce(async () => {
        return [{ ...VALID_USER, isSuperAdmin: true }];
      })
      .mockImplementationOnce(async () => {
        return [VALID_USER, VALID_USER];
      });

    const response = await useCase.execute({
      organizationId: VALID_ORGANIZATION.id,
      requestingUserId: VALID_USER.id,
      searchedUserId: VALID_USER.id,
    });

    expect(userRepository.findOneOrAllByIdAsAdmin).toBeCalledTimes(2);
    expect(userRepository.findOneOrAllByIdAsUser).toBeCalledTimes(0);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as UserEntity[]).length).toBe(2);
  });
});
