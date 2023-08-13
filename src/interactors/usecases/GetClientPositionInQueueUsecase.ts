import { Injectable, Inject } from '@nestjs/common';
import { ClientNotInQueueError, QueueNotFoundError } from '../../domain/errors';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class GetClientPositionInQueueUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}
  async execute(
    queueId?: string,
    registrationId?: string,
  ): Promise<Either<DomainError, number>> {
    const validation = Validator.validate({ id: [queueId] });
    if (validation.isLeft()) return left(validation.value);

    const queue = await this.queueRepository.findById(queueId);
    if (!queue) return left(new QueueNotFoundError());

    const position = await this.queueRepository.getPositionOfClient(
      queueId,
      registrationId,
    );

    if (position === -1) return left(new ClientNotInQueueError());
    return right(position + 1);
  }
}
