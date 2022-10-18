import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class AuthenticateUserUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  execute(email: string, password: string): Promise<Either<DomainError, any>> {
    throw new Error('Method not implemented.');
  }
}
