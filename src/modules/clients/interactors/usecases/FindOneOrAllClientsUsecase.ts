import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../domain/entities/Client.entity';
import { ClientNotFoundError } from '../../../common/domain/errors';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { UserRepository } from '../../../users/domain/repositories/UserRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class FindOneOrAllClientsUsecase implements UseCase {
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
  }): Promise<Either<DomainError, ClientEntity[]>> {
    const validation = Validator.validate({
      id: [clientId, userId, organizationId],
    });
    if (validation.isLeft()) return left(validation.value);

    const user = await this.userRepository.findOneByIdOrAll(userId);

    const isUserAdmin = user[0].isSuperAdmin;

    const clients = isUserAdmin
      ? await this.clientRepository.findOneOrAllByIdAsAdmin({
          clientId,
        })
      : await this.clientRepository.findOneOrAllByIdAsUser({
          organizationId,
          userId,
          clientId,
        });

    if (!clients && clientId) return left(new ClientNotFoundError());
    return right(clients ?? []);
  }
}
