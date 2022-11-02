import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { OrganizationNotFoundError } from '../../domain/errors';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class FindOneOrAllOrganizationsUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    id?: string,
  ): Promise<Either<DomainError, OrganizationEntity[]>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    const organizations = await this.organizationRepository.findOneByIdOrAll(
      id,
    );

    if (!organizations) return left(new OrganizationNotFoundError());
    return right(organizations);
  }
}
