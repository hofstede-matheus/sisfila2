import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { OrganizationCodeAlreadyUsedError } from '../../../common/domain/errors';
import { GroupRepository } from '../../../groups/domain/repositories/GroupRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { QueueRepository } from '../../../queues/domain/repositories/QueueRepository';
import { ServiceRepository } from '../../../services/domain/repositories/ServiceRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { UserRepository } from '../../../users/domain/repositories/UserRepository';

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
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute(
    name: string,
    code: string,
    userId: string,
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

    await this.userRepository.setUserRoleInOrganization(
      userId,
      organizationId,
      'TYPE_COORDINATOR',
    );

    return right(organizationId);
  }
}
