import { Inject, Injectable } from '@nestjs/common';
import { QueueEntity } from '../../modules/queues/domain/entities/Queue.entity';
import { QueueNotFoundError } from '../../domain/errors';
import { QueueRepository } from '../../modules/queues/domain/repositories/QueueRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class FindQueueByIdUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}
  async execute(id?: string): Promise<Either<DomainError, QueueEntity>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    const queues = await this.queueRepository.findById(id);

    if (!queues) return left(new QueueNotFoundError());
    return right(queues);
  }
}
