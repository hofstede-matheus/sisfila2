import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { InvalidUserTypeError } from '../../domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { EncryptionService } from '../../domain/services/EncryptionService';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreateUserUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
    @Inject(EncryptionService)
    private encryptionService: EncryptionService,
  ) {}
  async execute(
    name: string,
    email: string,
    password: string,
  ): Promise<Either<DomainError, string>> {
    const validation = UserEntity.build(name, email, password);
    if (validation.isLeft()) return left(validation.value);

    const encryptedPassword = await this.encryptionService.encrypt(password);

    const user = await this.userRepository.create(
      validation.value.name,
      validation.value.email,
      encryptedPassword,
    );

    return right(user);
  }
}
