import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { DeskRepository } from '../../domain/repositories/DeskRepository';
import { DeskEntity } from '../../domain/entities/Desk.entity';

@Injectable()
export class UpdateDeskUsecase implements UseCase {
  constructor(
    @Inject(DeskRepository)
    private deskRepository: DeskRepository,
  ) {}

  async execute(
    id: string,
    name: string,
    attendantId: string,
    services: string[],
  ): Promise<Either<DomainError, DeskEntity>> {
    const validation = DeskEntity.validateEdit(id, name, attendantId, services);
    if (validation.isLeft()) return left(validation.value);

    const updatedDesk = await this.deskRepository.update(
      id,
      name,
      attendantId,
      services,
    );

    return right(updatedDesk);
  }
}
