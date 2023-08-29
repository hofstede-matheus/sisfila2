import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../../clients/domain/entities/Client.entity';
import { ClientRepository } from '../../../clients/domain/repositories/ClientRepository';
import { GroupRepository } from '../../../groups/domain/repositories/GroupRepository';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class AttachGroupsToQueueUsecase implements UseCase {
  constructor(
    // @Inject(OrganizationRepository)
    // private organizationRepository: OrganizationRepository,
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}
  async execute(
    userId: string,
    organizationId: string,
    queueId: string,
    groupIds: string[],
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [userId, organizationId, queueId, ...groupIds],
    });
    if (validation.isLeft()) return left(validation.value);

    await this.queueRepository.attachGroupsToQueue(groupIds, queueId);

    return right();
  }
}
