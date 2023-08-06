import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class CallNextClientOfQueueUsecase implements UseCase {
  constructor(
    // @Inject(OrganizationRepository)
    // private organizationRepository: OrganizationRepository,
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,

    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}
  async execute(
    organizationId: string,
    queueId: string,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [organizationId, queueId],
    });
    if (validation.isLeft()) return left(validation.value);

    // const user =
    //   await this.clientRepository.findByRegistrationIdFromOrganization(
    //     organizationId,
    //     registrationId,
    //   );

    // TODO: check if user is from organization

    // TODO: check if queue is from organziation inside callNextClient
    await this.queueRepository.callNextClient(queueId);

    // TODO: notify queue subscriber

    return right();
  }
}
