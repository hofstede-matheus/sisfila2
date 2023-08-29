import { Inject, Injectable } from '@nestjs/common';
import { ServiceEntity } from '../../domain/entities/Service.entity';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class CreateServiceUsecase implements UseCase {
  constructor(
    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,

    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    userId: string,
    name: string,
    subscriptionToken: string,
    guestEnrollment: boolean,
    organizationId: string,
    opensAt: string,
    closesAt: string,
  ): Promise<Either<DomainError, string>> {
    const validation = Validator.validate({
      id: [organizationId],
    });
    if (validation.isLeft()) return left(validation.value);

    const entityValidation = ServiceEntity.build(
      name,
      guestEnrollment,
      new Date(opensAt),
      new Date(closesAt),
    );
    if (entityValidation.isLeft()) return left(entityValidation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    const service = await this.serviceRepository.create(
      name,
      guestEnrollment,
      entityValidation.value.opensAt,
      entityValidation.value.closesAt,
      organizationId,
      subscriptionToken,
    );

    return right(service);
  }
}
