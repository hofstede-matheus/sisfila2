import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../../clients/domain/repositories/ClientRepository';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import {
  QueueNotFoundError,
  ServiceNotOpenError,
  UserNotInGroupError,
} from '../../../common/domain/errors';
import { GroupRepository } from '../../../groups/domain/repositories/GroupRepository';
import { ServiceRepository } from '../../../services/domain/repositories/ServiceRepository';
import * as moment from 'moment';
import { isBetweenIgnoringDate } from '../../../common/shared/helpers/moment';

@Injectable()
export class AttachClientToQueueUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,

    @Inject(ClientRepository)
    private clientRepository: ClientRepository,

    @Inject(GroupRepository)
    private groupRepository: GroupRepository,

    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
  ) {}
  async execute(
    registrationId: string,
    organizationId: string,
    queueId: string,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [organizationId, queueId],
    });
    if (validation.isLeft()) return left(validation.value);

    // get queue
    const queue = await this.queueRepository.findById(queueId);
    if (!queue) return left(new QueueNotFoundError());

    // get service of the queue
    const service = await this.serviceRepository.findById(queue.serviceId);

    // check if service is between working hours

    if (
      !isBetweenIgnoringDate(
        moment(new Date()),
        moment(service.opensAt),
        moment(service.closesAt),
      )
    ) {
      return left(new ServiceNotOpenError());
    }

    const user =
      await this.clientRepository.findByRegistrationIdFromOrganization(
        organizationId,
        registrationId,
      );

    const groups = await this.groupRepository.findGroupsByQueueId(queueId);

    const userIsInGroup = groups.some((group) =>
      group.clients.some((client) => client.id === user.id),
    );

    if (!userIsInGroup) {
      return left(new UserNotInGroupError());
    }

    await this.queueRepository.attachClientToQueue(user.id, queueId);

    return right();
  }
}
