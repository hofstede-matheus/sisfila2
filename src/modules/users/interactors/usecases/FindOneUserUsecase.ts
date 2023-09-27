import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { UserNotFoundError } from '../../../common/domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class FindOneUserUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute({
    organizationId,
    requestingUserId,
    searchedUserId,
  }: {
    organizationId?: string;
    requestingUserId?: string;
    searchedUserId?: string;
  }): Promise<Either<DomainError, UserEntity[]>> {
    const validation = Validator.validate({
      id: [organizationId, requestingUserId, searchedUserId],
    });
    if (validation.isLeft()) return left(validation.value);

    const requestingUser = await this.userRepository.findOneOrAllByIdAsAdmin({
      searchedUserId: requestingUserId,
    });

    const users = requestingUser[0].isSuperAdmin
      ? await this.userRepository.findOneOrAllByIdAsAdmin({
          searchedUserId,
        })
      : await this.userRepository.findOneOrAllByIdAsUser({
          organizationId,
          requestingUserId,
          searchedUserId,
        });

    if (!users) return left(new UserNotFoundError());
    return right(users);
  }
}
