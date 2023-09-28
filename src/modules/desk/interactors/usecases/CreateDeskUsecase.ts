import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { DeskEntity } from '../../domain/entities/Desk.entity';
import { DeskRepository } from '../../domain/repositories/DeskRepository';

@Injectable()
export class CreateDeskUsecase implements UseCase {
  constructor(
    @Inject(DeskRepository)
    private deskRepository: DeskRepository,
  ) {}

  async execute(
    name: string,
    organizationId: string,
    servicesIds: string[],
  ): Promise<Either<DomainError, DeskEntity>> {
    const validation = DeskEntity.build(name, organizationId, servicesIds);
    if (validation.isLeft()) return left(validation.value);

    const newDesk = await this.deskRepository.create(name, organizationId);

    const updatedDesk = await this.deskRepository.update(
      newDesk.id,
      undefined,
      undefined,
      servicesIds,
    );

    return right(updatedDesk);
  }
}
