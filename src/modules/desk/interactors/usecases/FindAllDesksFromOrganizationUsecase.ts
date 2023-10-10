import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { DeskRepository } from '../../domain/repositories/DeskRepository';
import { DeskEntity } from '../../domain/entities/Desk.entity';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class FindAllDesksFromOrganizationUsecase implements UseCase {
  constructor(
    @Inject(DeskRepository)
    private deskRepository: DeskRepository,
  ) {}

  async execute({
    organizationId,
  }: {
    organizationId: string;
    id?: string;
  }): Promise<Either<DomainError, DeskEntity[]>> {
    const validation = Validator.validate({ id: [organizationId] });
    if (validation.isLeft()) return left(validation.value);

    // TODO: check if desk is from organization

    const desks = await this.deskRepository.findAllByOrganizationId(
      organizationId,
    );

    return right(desks);
  }
}
