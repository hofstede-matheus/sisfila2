import { Inject, Injectable } from '@nestjs/common';
import { UserEntity, UserEntityTypes } from '../../domain/entities/User.entity';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import {
  RequestingUserNotFoundError,
  UserHasNoPermissionInOrganization,
  UserNotFoundError,
} from '../../../common/domain/errors';
import { EmailService } from '../../../common/domain/services/EmailService';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class RemoveUserFromOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
    @Inject(EmailService)
    private emailService: EmailService,
  ) {}
  async execute(
    organizationId: string,
    requestingUserId: string,
    userId: string,
  ): Promise<Either<DomainError, UserEntity>> {
    const validation = Validator.validate({
      id: [organizationId, requestingUserId, userId],
    });
    if (validation.isLeft()) return left(validation.value);

    const requestingUser = await this.userRepository.findOneByIdOrAll(
      requestingUserId,
    );

    if (!requestingUser) {
      return left(new RequestingUserNotFoundError());
    }

    const isRequestingUserFromOrganizationAndRoleIsCoordinator =
      requestingUser[0].rolesInOrganizations.find(
        (roleInOrganization) =>
          roleInOrganization.organizationId === organizationId &&
          roleInOrganization.role === UserEntityTypes.TYPE_COORDINATOR,
      );

    if (!isRequestingUserFromOrganizationAndRoleIsCoordinator) {
      return left(new UserHasNoPermissionInOrganization());
    }

    const userToRemove = await this.userRepository.findOneByIdOrAll(userId);

    if (!userToRemove) {
      return left(new UserNotFoundError());
    }

    await this.userRepository.removeUserFromOrganization(
      userId,
      organizationId,
    );

    await this.emailService.sendEmail(
      userToRemove[0].email,
      'Você foi removido de uma organização',
      `Você foi removidp de uma organização com id ${organizationId}`,
    );

    return right();
  }
}
