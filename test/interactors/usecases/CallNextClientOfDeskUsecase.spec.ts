import { TestingModule, Test } from '@nestjs/testing';
import { CallNextClientOfDeskUsecase } from '../../../src/modules/desk/interactors/usecases/CallNextClientOfDeskUsecase';
import { QueueRepository } from '../../../src/modules/queues/domain/repositories/QueueRepository';
import { ServiceRepository } from '../../../src/modules/services/domain/repositories/ServiceRepository';
import {
  ALL_REPOSITORIES_PROVIDERS,
  ALL_SERVICES_PROVIDERS,
  VALID_CLIENT,
  VALID_DESK,
  VALID_QUEUE,
  VALID_SERVICE,
} from '../../helpers';
import { InvalidIdError } from '../../../src/modules/common/domain/errors';
import { ClientInQueue } from '../../../src/modules/queues/domain/entities/Queue.entity';
import * as moment from 'moment';
import { DeskRepository } from '../../../src/modules/desk/domain/repositories/DeskRepository';

// CallNextClientOfDeskUsecase
describe('CallNextClientOfDeskUsecase', () => {
  let useCase: CallNextClientOfDeskUsecase;
  let serviceRepository: ServiceRepository;
  let queueRepository: QueueRepository;
  let deskRepository: DeskRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...ALL_REPOSITORIES_PROVIDERS,
        ...ALL_SERVICES_PROVIDERS,
        CallNextClientOfDeskUsecase,
      ],
    }).compile();

    serviceRepository = module.get<ServiceRepository>(ServiceRepository);
    queueRepository = module.get<QueueRepository>(QueueRepository);
    deskRepository = module.get<DeskRepository>(DeskRepository);
    useCase = module.get<CallNextClientOfDeskUsecase>(
      CallNextClientOfDeskUsecase,
    );
  });

  it('should not be able to call next client when deskId is invalid', async () => {
    const response = await useCase.execute('invalid_uuid', 'valid_uuid');
    expect(response.isLeft()).toBeTruthy();
    expect(response.value).toEqual(new InvalidIdError());
  });

  it('should be able to call next client when there is one service with two queues with different priorities', async () => {
    // arrange

    jest
      .spyOn(serviceRepository, 'findByDeskId')
      .mockImplementation(async () => {
        return [VALID_SERVICE];
      });

    jest
      .spyOn(queueRepository, 'findByServiceId')
      .mockImplementation(async () => {
        return [
          {
            ...VALID_QUEUE,
            priority: 1,
            clientsInQueue: [VALID_CLIENT] as ClientInQueue[],
          },
          {
            ...VALID_QUEUE,
            priority: 2,
            clientsInQueue: [
              { ...VALID_CLIENT, id: 'another_id' },
            ] as ClientInQueue[],
          },
        ];
      });

    jest.spyOn(queueRepository, 'callClient');

    // act
    const response = await useCase.execute(VALID_DESK.id, 'valid_uuid');

    // assert
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual(VALID_CLIENT);
    expect(queueRepository.callClient).toBeCalledTimes(1);
    expect(queueRepository.callClient).toBeCalledWith(
      'valid_uuid',
      VALID_QUEUE.id,
      VALID_CLIENT.id,
    );
  });

  it('should be able to call next client when there is one service with two queues with same priorities but the second one has entered earlier', async () => {
    // arrange

    jest
      .spyOn(serviceRepository, 'findByDeskId')
      .mockImplementation(async () => {
        return [VALID_SERVICE];
      });

    jest
      .spyOn(queueRepository, 'findByServiceId')
      .mockImplementation(async () => {
        return [
          {
            ...VALID_QUEUE,
            priority: 1,
            clientsInQueue: [
              { ...VALID_CLIENT, createdAt: moment().add(1, 'day').toDate() },
            ] as ClientInQueue[],
          },
          {
            ...VALID_QUEUE,
            priority: 1,
            clientsInQueue: [
              { ...VALID_CLIENT, id: 'another_id' },
            ] as ClientInQueue[],
          },
        ];
      });

    jest.spyOn(queueRepository, 'callClient');

    // act
    const response = await useCase.execute(VALID_DESK.id, 'valid_uuid');

    // assert
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual({ ...VALID_CLIENT, id: 'another_id' });
    expect(queueRepository.callClient).toBeCalledTimes(1);
    expect(queueRepository.callClient).toBeCalledWith(
      'valid_uuid',
      VALID_QUEUE.id,
      'another_id',
    );
  });

  it('should be able to call next client when there is one service with two queues with different priorities but first queue is empty', async () => {
    // arrange

    jest
      .spyOn(serviceRepository, 'findByDeskId')
      .mockImplementation(async () => {
        return [VALID_SERVICE];
      });

    jest
      .spyOn(queueRepository, 'findByServiceId')
      .mockImplementation(async () => {
        return [
          {
            ...VALID_QUEUE,
            priority: 1,
            clientsInQueue: [] as ClientInQueue[],
          },
          {
            ...VALID_QUEUE,
            priority: 2,
            clientsInQueue: [
              { ...VALID_CLIENT, id: 'another_id' },
            ] as ClientInQueue[],
          },
        ];
      });

    jest.spyOn(queueRepository, 'callClient');

    // act
    const response = await useCase.execute(VALID_DESK.id, 'valid_uuid');

    // assert
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual({ ...VALID_CLIENT, id: 'another_id' });
    expect(queueRepository.callClient).toBeCalledTimes(1);
    expect(queueRepository.callClient).toBeCalledWith(
      'valid_uuid',
      VALID_QUEUE.id,
      'another_id',
    );
  });

  it('should be able to call next client when there is one service with three queues with different priorities but first and second queues are empty', async () => {
    // arrange

    jest
      .spyOn(serviceRepository, 'findByDeskId')
      .mockImplementation(async () => {
        return [VALID_SERVICE];
      });

    jest
      .spyOn(queueRepository, 'findByServiceId')
      .mockImplementation(async () => {
        return [
          {
            ...VALID_QUEUE,
            priority: 1,
            clientsInQueue: [] as ClientInQueue[],
          },
          {
            ...VALID_QUEUE,
            priority: 2,
            clientsInQueue: [] as ClientInQueue[],
          },
          {
            ...VALID_QUEUE,
            priority: 3,
            clientsInQueue: [
              { ...VALID_CLIENT, id: 'another_id' },
            ] as ClientInQueue[],
          },
        ];
      });

    jest.spyOn(queueRepository, 'callClient');

    // act
    const response = await useCase.execute(VALID_DESK.id, 'valid_uuid');

    // assert
    expect(response.isRight()).toBeTruthy();
    expect(response.value).toEqual({ ...VALID_CLIENT, id: 'another_id' });
    expect(queueRepository.callClient).toBeCalledTimes(1);
    expect(queueRepository.callClient).toBeCalledWith(
      'valid_uuid',
      VALID_QUEUE.id,
      'another_id',
    );
  });
});
