import { Inject, Injectable } from '@nestjs/common';
import { UserEntity, UserEntityTypes } from '../../domain/entities/User.entity';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import {
  RequestingUserNotFoundError,
  UserHasNoPermissionInOrganization,
} from '../../../common/domain/errors';
import { EmailService } from '../../../common/domain/services/EmailService';

@Injectable()
export class SetUserRoleInOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
    @Inject(EmailService)
    private emailService: EmailService,
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

    const isRequestingUserFromOrganizationAndRoleIsCoordinator =
      requestingUser[0].rolesInOrganizations.find(
        (roleInOrganization) =>
          roleInOrganization.organizationId === organizationId &&
          roleInOrganization.role === UserEntityTypes.TYPE_COORDINATOR,
      );

    if (!isRequestingUserFromOrganizationAndRoleIsCoordinator) {
      return left(new UserHasNoPermissionInOrganization());
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

    await this.emailService.sendEmail(
      userEmail,
      'Você foi adicionado a uma organização',
      `Você foi adicionado a uma organização com id ${organizationId} e role ${role}`,
    );

    return right(updateduser);
  }
}
