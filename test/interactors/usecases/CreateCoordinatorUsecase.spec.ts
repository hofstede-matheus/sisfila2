import { Test, TestingModule } from '@nestjs/testing';
import { CreateCoordinatorUsecase } from '../../../src/interactors/usecases/CreateCoordinatorUsecase';

describe('CreateCoordinatorUsecase', () => {
  let useCase: CreateCoordinatorUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [CreateCoordinatorUsecase],
    }).compile();
    useCase = module.get<CreateCoordinatorUsecase>(CreateCoordinatorUsecase);
  });
});
