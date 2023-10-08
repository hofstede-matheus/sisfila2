import { TestingModule, Test } from '@nestjs/testing';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_QUEUE,
} from '../../helpers';
import { InvalidIdError } from '../../../src/modules/common/domain/errors';
import { SubscribeToQueueUsecase } from '../../../src/modules/clients/interactors/usecases/SubscribeToQueueUsecase';

describe('SubscribeToQueueUsecase', () => {
  let useCase: SubscribeToQueueUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        SubscribeToQueueUsecase,
      ],
    }).compile();

    useCase = module.get<SubscribeToQueueUsecase>(SubscribeToQueueUsecase);
  });

  it('should not subscribe to queue if queueId is invalid', async () => {
    const response = await useCase.execute('123', '123');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toBeInstanceOf(InvalidIdError);
  });

  it('should subscribe to queue', async () => {
    const response = await useCase.execute('123', VALID_QUEUE.id);
    expect(response.isRight()).toBeTruthy();
  });
});
