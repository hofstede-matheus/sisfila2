import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { OrganizationCodeAlreadyUsedError } from '../../domain/errors';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { QueueRepository } from '../../domain/repositories/QueueRepository';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreateOrganizationUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @Inject(ServiceRepository)
    private serviceRepository: ServiceRepository,
    @Inject(QueueRepository)
    private queueRepository: QueueRepository,
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
  ) {}
  async execute(
    name: string,
    code: string,
  ): Promise<Either<DomainError, string>> {
    const validation = OrganizationEntity.build(name, code);
    if (validation.isLeft()) return left(validation.value);

    const organizationInDatabase = await this.organizationRepository.findByCode(
      code,
    );

    if (organizationInDatabase) {
      return left(new OrganizationCodeAlreadyUsedError());
    }

    const organizationId = await this.organizationRepository.create(
      validation.value.name,
      validation.value.code,
    );

    const serviceId = await this.serviceRepository.create(
      'Default Service',
      true,
      new Date(),
      new Date(),
      organizationId,
      'default',
    );

    await this.queueRepository.create(
      'Default Queue',
      1,
      'DEFAULT',
      organizationId,
      serviceId,
      'default',
    );

    await this.groupRepository.create('Default Group', organizationId);

    return right(organizationId);
  }
}
