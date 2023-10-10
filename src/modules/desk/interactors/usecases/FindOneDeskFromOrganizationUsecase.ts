import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { DeskRepository } from '../../domain/repositories/DeskRepository';
import { DeskWithCalledClient } from '../../domain/entities/Desk.entity';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class FindOneDeskFromOrganizationUsecase implements UseCase {
  constructor(
    @Inject(DeskRepository)
    private deskRepository: DeskRepository,
  ) {}

  async execute({
    organizationId,
    id,
  }: {
    organizationId: string;
    id?: string;
  }): Promise<Either<DomainError, DeskWithCalledClient>> {
    const validation = Validator.validate({ id: [organizationId] });
    if (validation.isLeft()) return left(validation.value);

    // TODO: check if desk is from organization

    const desk = await this.deskRepository.findById(id);
    const client = await this.deskRepository.getLastClientCalledFromDesk(id);
    return right({
      desk,
      client,
    });
  }
}
