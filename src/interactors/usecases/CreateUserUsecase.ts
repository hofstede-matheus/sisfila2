import { Injectable } from '@nestjs/common';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class CreatePostUsecase implements UseCase {
  execute(...args: any[]): Promise<Either<DomainError, any>> {
    throw new Error('Method not implemented.');
  }
}
