import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { DeskRepository } from '../../domain/repositories/DeskRepository';
import { ServiceRepository } from '../../../services/domain/repositories/ServiceRepository';
import { isServiceOpen } from '../../../common/shared/helpers/moment';
import { QueueRepository } from '../../../queues/domain/repositories/QueueRepository';
import { ClientEntity } from '../../../clients/domain/entities/Client.entity';

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
  ): Promise<Either<DomainError, ClientEntity | undefined>> {
    const validation = Validator.validate({
      id: [deskId],
    });
    if (validation.isLeft()) return left(validation.value);

    // get services from desk
    const services = await this.serviceRepository.findByDeskId(deskId);
    // filter out services that are not open
    const openServices = services.filter((service) => {
      return isServiceOpen(service.opensAt, service.closesAt);
    });
    // get queues from services
    const queues = await Promise.all(
      openServices.map((service) => {
        return this.queueRepository.findByServiceId(service.id);
      }),
    );

    const queuesFlat = queues.flat();

    // get queues with highest priority (can be more then one) (lower is more priority)
    const queuesWithHighestPriority = queuesFlat.filter((queue) => {
      return queue.priority === Math.min(...queuesFlat.map((q) => q.priority));
    });
    // merge clientsInQueue from queues and sort by createdAt
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

    if (client) {
      await this.queueRepository.callClient(
        attendentId,
        client.queueId,
        client.id,
      );

      // TODO: notify queue subscriber

      return right({
        id: client.id,
        name: client.name,
        organizationId: client.organizationId,
        registrationId: client.registrationId,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      });
    }

    return right(null);
  }
}
