import { Inject, Injectable } from '@nestjs/common';
import { UserEntity, UserEntityTypes } from '../../domain/entities/User.entity';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import {
  RequestingUserNotFoundError,
  UserNotFromOrganizationError,
} from '../../../common/domain/errors';

@Injectable()
export class SetUserRoleInOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute(
    organizationId: string,
    role: UserEntityTypes | undefined,
    requestingUserId: string,
    userId?: string,
    userEmail?: string,
  ): Promise<Either<DomainError, UserEntity>> {
    const validation = UserEntity.validateEdit(
      userId,
      organizationId,
      role,
      userEmail,
    );
    if (validation.isLeft()) return left(validation.value);

    const requestingUser = await this.userRepository.findOneByIdOrAll(
      requestingUserId,
    );

    if (!requestingUser) {
      return left(new RequestingUserNotFoundError());
    }

    // check if requesting user is from organization
    const isRequestingUserFromOrganization =
      requestingUser[0].rolesInOrganizations.find(
        (roleInOrganization) =>
          roleInOrganization.organizationId === organizationId,
      );

    if (!isRequestingUserFromOrganization) {
      return left(new UserNotFromOrganizationError());
    }

    if (userId) {
      const updateduser = await this.userRepository.setUserRoleInOrganization(
        userId,
        organizationId,
        role,
      );
      return right(updateduser);
    }

    const { id: userToUpdateId } = await this.userRepository.findByEmail(
      userEmail,
    );

    const updateduser = await this.userRepository.setUserRoleInOrganization(
      userToUpdateId,
      organizationId,
      role,
    );

    return right(updateduser);
  }
}
