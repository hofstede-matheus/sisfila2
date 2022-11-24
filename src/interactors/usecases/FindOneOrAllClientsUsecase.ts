import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../domain/entities/Client.entity';
import { ClientNotFoundError } from '../../domain/errors';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

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

    const clients = user[0].isSuperAdmin
      ? await this.clientRepository.findOneByIdOrAllAsAdmin({
          clientId,
        })
      : await this.clientRepository.findOneByIdOrAllAsUser({
          organizationId,
          userId,
          clientId,
        });

    if (!clients) return left(new ClientNotFoundError());
    return right(clients);
  }
}
