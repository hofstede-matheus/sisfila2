import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntityWithRoleInOrganization } from '../../domain/entities/Organization.entity';
import { OrganizationNotFoundError } from '../../../common/domain/errors';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { UserRepository } from '../../../users/domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class FindOneOrAllOrganizationsUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute({
    organizationId,
    userId,
  }: {
    organizationId?: string;
    userId?: string;
  }): Promise<Either<DomainError, OrganizationEntityWithRoleInOrganization[]>> {
    const validation = Validator.validate({ id: [organizationId, userId] });
    if (validation.isLeft()) return left(validation.value);

    const user = await this.userRepository.findOneByIdOrAll(userId);

    const organizations = user[0].isSuperAdmin
      ? await this.organizationRepository.findOneOrAllByIdAsAdmin({
          organizationId,
        })
      : await this.organizationRepository.findOneOrAllByIdAsUser({
          organizationId,
          userId,
        });

    if (organizations.length === 0)
      return left(new OrganizationNotFoundError());

    if (!userId) {
      return right([
        {
          id: organizations[0].id,
          name: organizations[0].name,
          code: organizations[0].code,
          createdAt: organizations[0].createdAt,
          updatedAt: organizations[0].updatedAt,
          roleInOrganization: undefined,
        },
      ]);
    }

    const organizationsWithRoleInOrganization: OrganizationEntityWithRoleInOrganization[] =
      organizations.map((organization) => {
        return {
          ...organization,
          roleInOrganization: user[0].rolesInOrganizations.find(
            (roleInOrganization) =>
              roleInOrganization.organizationId === organization.id,
          ).role,
        };
      });

    return right(organizationsWithRoleInOrganization);
  }
}
