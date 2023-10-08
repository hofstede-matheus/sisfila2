import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { NotificationService } from '../../../common/domain/services/NotificationService';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class SubscribeToQueueUsecase implements UseCase {
  constructor(
    @Inject(NotificationService)
    private notificationService: NotificationService,
  ) {}
  async execute(
    token: string,
    queueId: string,
  ): Promise<Either<DomainError, void>> {
    const validId = Validator.validate({ id: [queueId] });
    if (validId.isLeft()) return left(validId.value);

    await this.notificationService.subscribeToTopic(queueId, token);
    return right();
  }
}
