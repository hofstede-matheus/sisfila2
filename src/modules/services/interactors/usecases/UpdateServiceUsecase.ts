import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { ServiceEntity } from '../../domain/entities/Service.entity';

@Injectable()
export class UpdateServiceUsecase implements UseCase {
  constructor(
    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
  ) {}
  async execute(
    id: string,
    name?: string,
    subscriptionToken?: string,
    guestEnrollment?: boolean,
    opensAt?: string,
    closesAt?: string,
    queueIds?: string[],
  ): Promise<Either<DomainError, ServiceEntity>> {
    const opensAtDate = opensAt ? new Date(opensAt) : undefined;
    const closesAtDate = closesAt ? new Date(closesAt) : undefined;

    const entityValidation = ServiceEntity.validateEdit(
      id,
      name,
      guestEnrollment,
      opensAtDate,
      closesAtDate,
    );

    if (entityValidation.isLeft()) return left(entityValidation.value);

    // TODO: check if user is TYPE_COORDINATOR for this organization

    const mapOfQueueIdsIndexedByPosition: Map<number, string> = new Map();
    if (queueIds) {
      queueIds.forEach((queueId, index) => {
        mapOfQueueIdsIndexedByPosition.set(index, queueId);
      });
    }

    const updatedService = await this.serviceRepository.update(
      id,
      name,
      subscriptionToken,
      guestEnrollment,
      opensAtDate,
      closesAtDate,
      mapOfQueueIdsIndexedByPosition,
    );

    return right(updatedService);
  }
}
