import { Injectable } from '@nestjs/common';
import { UserEntityTypes } from '../../domain/entities/User.entity';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreateCoordinatorUsecase implements UseCase {
  execute(
    name: string,
    email: string,
    password: string,
    userType: UserEntityTypes,
  ): Promise<Either<DomainError, any>> {
    throw new Error('Method not implemented.');
  }
}
