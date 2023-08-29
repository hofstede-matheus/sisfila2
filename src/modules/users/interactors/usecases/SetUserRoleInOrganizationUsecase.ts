import { Inject, Injectable } from '@nestjs/common';
import { UserEntityTypes } from '../../domain/entities/User.entity';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class SetUserRoleInOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute(
    organizationId: string,
    role: UserEntityTypes | undefined,
    userId?: string,
    userEmail?: string,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [userId, organizationId],
      userEntityTypes: [role],
      email: [userEmail],
    });
    if (validation.isLeft()) return left(validation.value);

    if (userId) {
      await this.userRepository.setUserRoleInOrganization(
        userId,
        organizationId,
        role,
      );
      return right();
    }

    const { id: userToUpdateId } = await this.userRepository.findByEmail(
      userEmail,
    );

    await this.userRepository.setUserRoleInOrganization(
      userToUpdateId,
      organizationId,
      role,
    );

    return right();
  }
}
