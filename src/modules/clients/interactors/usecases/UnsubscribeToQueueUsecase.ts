import { Inject, Injectable } from '@nestjs/common';
import { Either, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { NotificationService } from '../../../common/domain/services/NotificationService';

@Injectable()
export class UnsubscribeToQueueUsecase implements UseCase {
  constructor(
    @Inject(NotificationService)
    private notificationService: NotificationService,
  ) {}
  async execute(
    token: string,
    queueId: string,
  ): Promise<Either<DomainError, void>> {
    await this.notificationService.unsubscribeFromTopic(queueId, token);
    return right();
  }
}
