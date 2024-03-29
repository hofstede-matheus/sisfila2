import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { OrganizationCodeAlreadyUsedError } from '../../../common/domain/errors';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

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
  ): Promise<Either<DomainError, OrganizationEntity>> {
    const entityValidation = OrganizationEntity.validateEdit(id, name, code);
    const validation = Validator.validate({
      id: [id],
    });

    if (entityValidation.isLeft()) return left(entityValidation.value);
    if (validation.isLeft()) return left(validation.value);

    if (code) {
      const organization = await this.organizationRepository.findByCode(code);

      if (organization) return left(new OrganizationCodeAlreadyUsedError());
    }
    // TODO: check if user is TYPE_COORDINATOR for this organization

    const updatedOrganization = await this.organizationRepository.update(
      id,
      name,
      code,
    );

    return right(updatedOrganization);
  }
}
