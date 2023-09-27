import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { UserNotFromOrganizationError } from '../../../common/domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { OrganizationRepository } from '../../../organizations/domain/repositories/OrganizationRepository';

@Injectable()
export class FindAllFromOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute({
    organizationId,
    requestingUserId,
  }: {
    organizationId: string;
    requestingUserId: string;
  }): Promise<Either<DomainError, UserEntity[]>> {
    const validation = Validator.validate({
      id: [organizationId, requestingUserId],
    });
    if (validation.isLeft()) return left(validation.value);

    const requestingUser = await this.userRepository.findOneOrAllByIdAsAdmin({
      searchedUserId: requestingUserId,
    });

    const isUserFromOrganization =
      await this.organizationRepository.checkIfUserIsFromOrganization(
        organizationId,
        requestingUser[0].id,
      );

    if (!isUserFromOrganization)
      return left(new UserNotFromOrganizationError());

    const users = await this.userRepository.findAllFromOrganizationAsUser({
      organizationId,
    });

    return right(users);
  }
}
