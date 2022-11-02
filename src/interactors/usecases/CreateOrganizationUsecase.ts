import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { CodeAlreadyExistsError } from '../../domain/errors';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreateOrganizationUsecase implements UseCase {
  constructor(
    @Inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
  ) {}
  async execute(
    name: string,
    code: string,
  ): Promise<Either<DomainError, string>> {
    const validation = OrganizationEntity.build(name, code);
    if (validation.isLeft()) return left(validation.value);

    const organizationInDatabase = await this.organizationRepository.findByCode(
      code,
    );

    if (organizationInDatabase) {
      return left(new CodeAlreadyExistsError());
    }

    const organization = await this.organizationRepository.create(
      validation.value.name,
      validation.value.code,
    );

    return right(organization);
  }
}
