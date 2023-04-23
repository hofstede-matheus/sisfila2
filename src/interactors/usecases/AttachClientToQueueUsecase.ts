import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';
import { UserNotInGroupError } from '../../domain/errors';
import { GroupRepository } from '../../domain/repositories/GroupRepository';

@Injectable()
export class AttachClientToQueueUsecase implements UseCase {
  constructor(
    // @Inject(OrganizationRepository)
    // private organizationRepository: OrganizationRepository,
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,

    @Inject(ClientRepository)
    private clientRepository: ClientRepository,

    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
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

    const user =
      await this.clientRepository.findByRegistrationIdFromOrganization(
        organizationId,
        registrationId,
      );

    // check if that user is from a group that is attached to the queue
    const groups = await this.groupRepository.findGroupsByQueueId(queueId);

    // check if the user is in any of the groups
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
