import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../../clients/domain/repositories/ClientRepository';
import { QueueRepository } from '../../../queues/domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import {
  QueueNotFoundError,
  ServiceNotOpenError,
} from '../../../common/domain/errors';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { isServiceOpen } from '../../../common/shared/helpers/moment';

@Injectable()
export class AttachClientToServiceUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,

    @Inject(ClientRepository)
    private clientRepository: ClientRepository,

    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
  ) {}
  async execute(
    registrationId: string,
    organizationId: string,
    serviceId: string,
  ): Promise<
    Either<
      DomainError,
      {
        queueId: string;
        queueName: string;
        position: number;
      }
    >
  > {
    const validation = Validator.validate({
      id: [organizationId, serviceId],
    });
    if (validation.isLeft()) return left(validation.value);

    // get service
    const service = await this.serviceRepository.findById(serviceId);

    // check if service is between working hours

    if (!isServiceOpen(service.opensAt, service.closesAt)) {
      return left(new ServiceNotOpenError());
    }

    const user =
      await this.clientRepository.findByRegistrationIdFromOrganization(
        organizationId,
        registrationId,
      );

    // get queue given serviceId, organizationId and registrationId
    const queue =
      await this.queueRepository.attachClientToQueueByServiceIdOrganizationIdRegistrationId(
        serviceId,
        organizationId,
        user.id,
      );

    if (!queue) return left(new QueueNotFoundError());

    return right(queue);
  }
}
