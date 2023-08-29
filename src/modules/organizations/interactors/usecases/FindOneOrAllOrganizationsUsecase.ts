import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
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
  }): Promise<Either<DomainError, OrganizationEntity[]>> {
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

    if (!organizations) return left(new OrganizationNotFoundError());
    return right(organizations);
  }
}
