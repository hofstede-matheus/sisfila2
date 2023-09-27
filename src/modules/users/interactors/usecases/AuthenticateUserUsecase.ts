import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { InvalidCredentialsError } from '../../../common/domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationService } from '../../../common/domain/services/AuthenticationService';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';
import { EncryptionService } from '../../../common/domain/services/EncryptionService';

@Injectable()
export class AuthenticateUserUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,

    @Inject(EncryptionService)
    private encryptionService: EncryptionService,

    @Inject(AuthenticationService)
    private authenticationService: AuthenticationService,
  ) {}
  async execute(
    email: string,
    password: string,
  ): Promise<Either<DomainError, { token: string; user: UserEntity }>> {
    const validation = Validator.validate({
      email: [email],
      password: [password],
    });

    if (validation.isLeft()) return left(validation.value);

    const user = await this.userRepository.findByEmail(email);

    if (!user) return left(new InvalidCredentialsError());

    const isValidPassword = await this.encryptionService.check(
      user.password,
      password,
    );

    if (!isValidPassword) return left(new InvalidCredentialsError());

    const userWithoutPassword = { ...user, password: undefined } as UserEntity;

    const token = this.authenticationService.generate(user.id);

    return right({
      token,
      user: userWithoutPassword,
    });
  }
}
