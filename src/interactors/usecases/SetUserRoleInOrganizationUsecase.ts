import { Inject, Injectable } from '@nestjs/common';
import { UserEntityTypes } from '../../domain/entities/User.entity';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class SetUserRoleInOrganizationUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,

    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  execute(
    userId: string,
    organizationId: string,
    role: UserEntityTypes | undefined,
  ): Promise<Either<DomainError, void>> {
    throw new Error('Method not implemented.');
  }
}
