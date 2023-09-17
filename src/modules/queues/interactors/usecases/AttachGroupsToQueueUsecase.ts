import { Inject, Injectable } from '@nestjs/common';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class AttachGroupsAndServiceToQueueUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}
  async execute(
    userId: string,
    organizationId: string,
    queueId: string,
    groupIds?: string[],
    serviceId?: string,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [userId, organizationId, queueId, ...(groupIds ?? [])],
    });
    if (validation.isLeft()) return left(validation.value);

    if (groupIds && groupIds.length !== 0) {
      await this.queueRepository.attachGroupsToQueue(groupIds, queueId);
    }
    if (serviceId)
      await this.queueRepository.attachServiceToQueue(serviceId, queueId);

    return right();
  }
}
