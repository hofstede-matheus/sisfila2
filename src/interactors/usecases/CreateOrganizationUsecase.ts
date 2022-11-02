import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreateOrganizationUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  execute(name: string, code: string): Promise<Either<DomainError, string>> {
    throw new Error('Method not implemented.');
  }
}
