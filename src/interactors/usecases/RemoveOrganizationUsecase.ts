import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class RemoveOrganizationUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(id: string): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [id],
    });

    if (validation.isLeft()) return left(validation.value);

    this.organizationRepository.remove(id);
    return right();
  }
}
