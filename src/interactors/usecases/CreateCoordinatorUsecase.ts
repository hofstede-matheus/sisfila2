import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { InvalidUserTypeError } from '../../domain/errors/User.errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreateCoordinatorUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute(
    name: string,
    email: string,
    password: string,
    userType: string,
  ): Promise<Either<DomainError, string>> {
    if (userType !== 'TYPE_COORDINATOR') {
      return left(new InvalidUserTypeError());
    }

    const validation = UserEntity.build(name, email, password, userType);

    if (validation.isLeft()) return left(validation.value);
    const user = await this.userRepository.create(validation.value);

    return right(user);
  }
}
