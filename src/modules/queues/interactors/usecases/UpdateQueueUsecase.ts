import { Inject, Injectable } from '@nestjs/common';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { QueueEntity } from '../../domain/entities/Queue.entity';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';

@Injectable()
export class UpdateQueueUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    userId: string,
    organizationId: string,
    queueId: string,
    groupIds?: string[],
    serviceId?: string,
    name?: string,
    description?: string,
    code?: string,
    priority?: number,
  ): Promise<Either<DomainError, QueueEntity>> {
    const entityValidation = QueueEntity.validateEdit(
      userId,
      organizationId,
      queueId,
      groupIds,
      serviceId,
      name,
      description,
      code,
      priority,
    );

    if (entityValidation.isLeft()) return left(entityValidation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    if (groupIds) {
      await this.queueRepository.attachGroupsToQueue(groupIds, queueId);
    }
    if (serviceId)
      await this.queueRepository.attachServiceToQueue(serviceId, queueId);

    const updatedQueue = await this.queueRepository.update(
      queueId,
      name,
      description,
      code,
      priority,
    );

    return right(updatedQueue);
  }
}
