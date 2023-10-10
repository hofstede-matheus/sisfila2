import { Injectable, Inject } from '@nestjs/common';
import { ClientNotInQueueError } from '../../../common/domain/errors';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { ServiceRepository } from '../../../services/domain/repositories/ServiceRepository';
import { PositionInQueueWithDesk } from '../../domain/entities/Queue.entity';
import { DeskRepository } from '../../../desk/domain/repositories/DeskRepository';

@Injectable()
export class GetClientPositionInServiceUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,

    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
  ) {}
  async execute(
    serviceId: string,
    registrationId: string,
  ): Promise<Either<DomainError, PositionInQueueWithDesk>> {
    const validation = Validator.validate({ id: [serviceId] });
    if (validation.isLeft()) return left(validation.value);

    const service = await this.serviceRepository.findById(serviceId);

    const bestQueueForClient =
      await this.queueRepository.selectBestQueueForClient(
        serviceId,
        service.organizationId,
        registrationId,
      );

    const position = await this.queueRepository.getPositionOfClient(
      bestQueueForClient.id,
      registrationId,
    );

    if (position.position === -1) return left(new ClientNotInQueueError());

    return right({
      position: position.position,
      desk: position.desk,
    });
  }
}
