import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class RemoveOrganizationUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  execute(id: string): Promise<Either<DomainError, any>> {
    throw new Error('Method not implemented.');
  }
}
