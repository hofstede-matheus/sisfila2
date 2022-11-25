import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class RemoveClientUsecase implements UseCase {
  constructor(
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {}
  async execute({
    clientId,
    userId,
    organizationId,
  }: {
    clientId?: string;
    userId?: string;
    organizationId?: string;
  }): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [clientId, userId, organizationId],
    });

    if (validation.isLeft()) return left(validation.value);

    const user = await this.userRepository.findOneByIdOrAll(userId);

    user[0].isSuperAdmin
      ? await this.clientRepository.removeAsAdmin({
          clientId,
          organizationId,
        })
      : await this.clientRepository.removeAsUser({
          clientId,
          userId,
          organizationId,
        });

    return right();
  }
}
