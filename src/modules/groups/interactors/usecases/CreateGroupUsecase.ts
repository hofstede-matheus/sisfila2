import { Inject, Injectable } from '@nestjs/common';
import { GroupEntity } from '../../domain/entities/Group.entity';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class CreateGroupUsecase implements UseCase {
  constructor(
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    name: string,
    organizationId: string,
    userId: string,
  ): Promise<Either<DomainError, GroupEntity>> {
    const validation = Validator.validate({
      id: [userId, organizationId],
    });
    if (validation.isLeft()) return left(validation.value);

    const entityValidation = GroupEntity.build(name);
    if (entityValidation.isLeft()) return left(entityValidation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    const group = await this.groupRepository.create(name, organizationId);

    return right(group);
  }
}
