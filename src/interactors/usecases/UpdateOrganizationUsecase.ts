import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../modules/organizations/domain/entities/Organization.entity';
import { OrganizationCodeAlreadyUsedError } from '../../domain/errors';
import { OrganizationRepository } from '../../modules/organizations/domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class UpdateOrganizationUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    id: string,
    name?: string,
    code?: string,
  ): Promise<Either<DomainError, void>> {
    const entityValidation = OrganizationEntity.build(name, code);
    const validation = Validator.validate({
      id: [id],
    });

    if (entityValidation.isLeft()) return left(entityValidation.value);
    if (validation.isLeft()) return left(validation.value);

    const organization = await this.organizationRepository.findByCode(code);

    if (organization) return left(new OrganizationCodeAlreadyUsedError());

    this.organizationRepository.update(id, name, code);

    return right();
  }
}
