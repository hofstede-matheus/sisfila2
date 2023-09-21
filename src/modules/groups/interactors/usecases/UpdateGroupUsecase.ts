import { Inject, Injectable } from '@nestjs/common';
import { GroupEntity } from '../../domain/entities/Group.entity';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';

@Injectable()
export class UpdateGroupUsecase implements UseCase {
  constructor(
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    id: string,
    name: string,
    organizationId: string,
    userId: string,
  ): Promise<Either<DomainError, GroupEntity>> {
    const validation = GroupEntity.validateEdit(id, name, organizationId);
    if (validation.isLeft()) return left(validation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    const updatedGroup = await this.groupRepository.update(id, name);

    return right(updatedGroup);
  }
}
