import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class RemoveClientUsecase implements UseCase {
  constructor(
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}
  async execute(id: string): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [id],
    });

    if (validation.isLeft()) return left(validation.value);

    this.clientRepository.remove(id);
    return right();
  }
}
