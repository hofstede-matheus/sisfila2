import { Inject, Injectable } from '@nestjs/common';
import { QueueEntity } from '../../domain/entities/Queue.entity';
import { ServiceEntity } from '../../domain/entities/Service.entity';
import { UserNotFromOrganizationError } from '../../domain/errors';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class CreateQueueUsecase implements UseCase {
  constructor(
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,

    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    userId: string,
    name: string,
    priority: number,
    code: string,
    organizationId: string,
    serviceId: string,
    description?: string,
  ): Promise<Either<DomainError, string>> {
    const validation = Validator.validate({
      id: [organizationId],
    });
    if (validation.isLeft()) return left(validation.value);

    const entityValidation = QueueEntity.build(
      name,
      priority,
      code,
      description,
    );
    if (entityValidation.isLeft()) return left(entityValidation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    const queue = await this.queueRepository.create(
      name,
      priority,
      code,
      organizationId,
      serviceId,
      description,
    );

    return right(queue);
  }
}
