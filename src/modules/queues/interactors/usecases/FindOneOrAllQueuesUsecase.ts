import { Inject, Injectable } from '@nestjs/common';
import { QueueEntity } from '../../domain/entities/Queue.entity';
import { QueueNotFoundError } from '../../../common/domain/errors';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class FindOneOrAllQueuesUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
  ) {}
  async execute(id?: string): Promise<Either<DomainError, QueueEntity[]>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    const queues = await this.queueRepository.findByOrganizationId(id);

    if (!queues) return left(new QueueNotFoundError());
    return right(queues);
  }
}
