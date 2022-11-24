import { Test, TestingModule } from '@nestjs/testing';
import { InvalidIdError } from '../../../src/domain/errors';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_ORGANIZATION,
} from '../../helpers';
import { RemoveClientUsecase } from '../../../src/interactors/usecases/RemoveClientUsecase';
import { ClientRepository } from '../../../src/domain/repositories/ClientRepository';

describe('RemoveClientUsecase', () => {
  let useCase: RemoveClientUsecase;
  let clientRepository: ClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        RemoveClientUsecase,
      ],
    }).compile();

    useCase = module.get(RemoveClientUsecase);
    clientRepository = module.get<ClientRepository>(ClientRepository);
  });

  it('should not remove client with invalid id', async () => {
    const response = await useCase.execute('a');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should remove client with valid data', async () => {
    jest.spyOn(clientRepository, 'remove').mockImplementation(async () => {
      return;
    });

    const response = await useCase.execute(VALID_ORGANIZATION.id);

    expect(response.isRight()).toBeTruthy();
  });
});
