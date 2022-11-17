import { Test, TestingModule } from '@nestjs/testing';
import {
  InvalidIdError,
  OrganizationNotFoundError,
} from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../../helpers';
import { FindOneOrAllUsersUsecase } from '../../../src/interactors/usecases/FindOneOrAllUsersUsecase';
import { UserRepository } from '../../../src/domain/repositories/UserRepository';
import { UserEntity } from '../../../src/domain/entities/User.entity';

describe('FindOneOrAllUsersUsecase', () => {
  let useCase: FindOneOrAllUsersUsecase;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        FindOneOrAllUsersUsecase,
      ],
    }).compile();

    useCase = module.get(FindOneOrAllUsersUsecase);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should not be able to find an user with invalid id', async () => {
    const response = await useCase.execute('a');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should not be able to find an user that does not exists', async () => {
    jest.spyOn(repository, 'findOneByIdOrAll').mockImplementation(async () => {
      return undefined;
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id);
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new OrganizationNotFoundError());
  });

  it('should find one user data', async () => {
    jest.spyOn(repository, 'findOneByIdOrAll').mockImplementation(async () => {
      return [
        {
          id: VALID_USER.id,
          name: VALID_USER.name,
          email: VALID_USER.email,
          password: VALID_USER.password,
          createdAt: VALID_USER.createdAt,
          updatedAt: VALID_USER.updatedAt,
          isSuperAdmin: VALID_USER.isSuperAdmin,
        },
      ];
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as UserEntity[]).length).toBe(1);
  });

  it('should find all organizations data', async () => {
    jest.spyOn(repository, 'findOneByIdOrAll').mockImplementation(async () => {
      return [
        {
          id: VALID_USER.id,
          name: VALID_USER.name,
          email: VALID_USER.email,
          password: VALID_USER.password,
          createdAt: VALID_USER.createdAt,
          updatedAt: VALID_USER.updatedAt,
          isSuperAdmin: VALID_USER.isSuperAdmin,
        },
        {
          id: VALID_USER.id,
          name: VALID_USER.name,
          email: VALID_USER.email,
          password: VALID_USER.password,
          createdAt: VALID_USER.createdAt,
          updatedAt: VALID_USER.updatedAt,
          isSuperAdmin: VALID_USER.isSuperAdmin,
        },
      ];
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id);

    expect(response.isRight()).toBeTruthy();
    expect((response.value as UserEntity[]).length).toBe(2);
  });
});
