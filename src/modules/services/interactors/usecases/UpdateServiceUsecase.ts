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
    name: string,
    subscriptionToken: string,
    guestEnrollment: boolean,
    opensAt: string,
    closesAt: string,
  ): Promise<Either<DomainError, ServiceEntity>> {
    const entityValidation = ServiceEntity.validateEdit(
      id,
      name,
      guestEnrollment,
      new Date(opensAt),
      new Date(closesAt),
    );

    if (entityValidation.isLeft()) return left(entityValidation.value);

    // TODO: check if user is TYPE_COORDINATOR for this organization

    const updatedService = await this.serviceRepository.update(
      id,
      name,
      subscriptionToken,
      guestEnrollment,
      new Date(opensAt),
      new Date(closesAt),
    );

    return right(updatedService);
  }
}
