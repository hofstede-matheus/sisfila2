// RemoveDeskUsecase

import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { Injectable, Inject } from '@nestjs/common';
import { DeskRepository } from '../../domain/repositories/DeskRepository';

@Injectable()
export class RemoveDeskUsecase implements UseCase {
  constructor(
    @Inject(DeskRepository)
    private deskRepository: DeskRepository,
  ) {}

  async execute(id: string): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    // TODO: check if user has permission to remove desks from organization

    await this.deskRepository.removeFromOrganization(id);

    return right();
  }
}
