import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../domain/entities/Client.entity';
import { ClientAlreadyExistsError } from '../../../common/domain/errors';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';

@Injectable()
export class CreateClientUsecase implements UseCase {
  constructor(
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}
  async execute(
    name: string,
    organizationId: string,
    registrationId: string,
  ): Promise<Either<DomainError, string>> {
    const validation = ClientEntity.build(name, organizationId, registrationId);
    if (validation.isLeft()) return left(validation.value);

    const client =
      await this.clientRepository.findByRegistrationIdFromOrganization(
        organizationId,
        registrationId,
      );

    if (client) return left(new ClientAlreadyExistsError());

    const newClient = await this.clientRepository.create(
      name,
      organizationId,
      registrationId,
    );

    return right(newClient.id);
  }
}
