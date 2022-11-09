import { Inject, Injectable } from '@nestjs/common';
import { UserEntityTypes } from '../../domain/entities/User.entity';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class SetUserRoleInOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute(
    userId: string,
    organizationId: string,
    role: UserEntityTypes | undefined,
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({ id: [userId, organizationId] });
    if (validation.isLeft()) return left(validation.value);

    this.userRepository.setUserRoleInOrganization(userId, organizationId, role);

    return right();
  }
}
