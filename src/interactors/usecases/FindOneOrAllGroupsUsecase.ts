import { Inject, Injectable } from '@nestjs/common';
import { GroupEntity } from '../../domain/entities/Group.entity';
import { GroupNotFoundError } from '../../domain/errors';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class FindOneOrAllGroupsUsecase implements UseCase {
  constructor(
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
  ) {}
  async execute(id?: string): Promise<Either<DomainError, GroupEntity[]>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    const groups = await this.groupRepository.findByOrganizationId(id);

    if (!groups) return left(new GroupNotFoundError());
    return right(groups);
  }
}
