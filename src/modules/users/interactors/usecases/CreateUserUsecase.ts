import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { EmailAlreadyExistsError } from '../../../common/domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationService } from '../../../common/domain/services/AuthenticationService';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { EncryptionService } from '../../../common/domain/services/EncryptionService';

@Injectable()
export class CreateUserUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
    @Inject(EncryptionService)
    private encryptionService: EncryptionService,
    @Inject(AuthenticationService)
    private authenticationService: AuthenticationService,
  ) {}
  async execute(
    name: string,
    email: string,
    password: string,
  ): Promise<Either<DomainError, { token: string; user: UserEntity }>> {
    const validation = UserEntity.build(name, email, password);
    if (validation.isLeft()) return left(validation.value);

    const encryptedPassword = await this.encryptionService.encrypt(password);

    const userInDatabase = await this.userRepository.findByEmail(email);

    if (userInDatabase) return left(new EmailAlreadyExistsError());

    const user = await this.userRepository.create(
      validation.value.name,
      validation.value.email,
      encryptedPassword,
    );

    const token = this.authenticationService.generate(user.id);

    return right({ token: token, user });
  }
}
