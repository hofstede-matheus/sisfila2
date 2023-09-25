import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { ServiceRepository } from '../../../services/domain/repositories/ServiceRepository';
import { isServiceOpen } from '../../../common/shared/helpers/moment';
import { QueueRepository } from '../../../queues/domain/repositories/QueueRepository';
import { QueueEntity } from '../../../queues/domain/entities/Queue.entity';
import { DeskWithCalledClient } from '../../domain/entities/Desk.entity';
import { DeskRepository } from '../../domain/repositories/DeskRepository';

@Injectable()
export class CallNextClientOfDeskUsecase implements UseCase {
  constructor(
    @Inject(DeskRepository)
    private deskRepository: DeskRepository,

    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,

    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}
  async execute(
    deskId: string,
    attendentId: string,
  ): Promise<Either<DomainError, DeskWithCalledClient>> {
    const validation = Validator.validate({
      id: [deskId],
    });
    if (validation.isLeft()) return left(validation.value);

    const services = await this.serviceRepository.findByDeskId(deskId);
    const openServices = services.filter((service) => {
      return isServiceOpen(service.opensAt, service.closesAt);
    });

    const queues = await Promise.all(
      openServices.map((service) => {
        return this.queueRepository.findByServiceId(service.id);
      }),
    );

    const queuesFlat = queues.flat();

    const client = findNextClientOnQueue(queuesFlat);

    if (client) {
      await this.queueRepository.callClient(
        attendentId,
        client.queueId,
        client.id,
      );

      // TODO: notify queue subscriber

      const desk = await this.deskRepository.findById(deskId);

      return right({
        client: {
          id: client.id,
          name: client.name,
          organizationId: client.organizationId,
          registrationId: client.registrationId,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        },
        desk: desk,
      });
    } else {
      return right(null);
    }
  }
}

function findNextClientOnQueue(queues: QueueEntity[]) {
  if (queues.length === 0) return null;

  const queuesWithHighestPriority = queues.filter((queue) => {
    return queue.priority === Math.min(...queues.map((q) => q.priority));
  });

  const clientsInQueue = queuesWithHighestPriority
    .map((queue) =>
      queue.clientsInQueue.map((client) => {
        return { ...client, queueId: queue.id };
      }),
    )
    .flat()
    .sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  // get first client in queue
  const client = clientsInQueue[0];

  if (client) return client;
  else {
    const queuesWithoutHighestPriority = queues.filter((queue) => {
      return queue.priority !== Math.min(...queues.map((q) => q.priority));
    });

    return findNextClientOnQueue(queuesWithoutHighestPriority);
  }
}
