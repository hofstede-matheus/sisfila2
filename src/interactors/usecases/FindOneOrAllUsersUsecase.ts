import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/entities/Organization.entity';
import { UserEntity } from '../../domain/entities/User.entity';
import {
  OrganizationNotFoundError,
  UserNotFoundError,
} from '../../domain/errors';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class FindOneOrAllUsersUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute(id?: string): Promise<Either<DomainError, UserEntity[]>> {
    const validation = Validator.validate({ id: [id] });
    if (validation.isLeft()) return left(validation.value);

    const users = await this.userRepository.findOneByIdOrAll(id);

    if (!users) return left(new UserNotFoundError());
    return right(users);
  }
}
