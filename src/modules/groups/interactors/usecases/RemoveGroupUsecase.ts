import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';

@Injectable()
export class RemoveGroupUsecase implements UseCase {
  constructor(
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [id, organizationId, userId],
    });

    if (validation.isLeft()) return left(validation.value);

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        userId,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    this.groupRepository.remove(id);
    return right();
  }
}
