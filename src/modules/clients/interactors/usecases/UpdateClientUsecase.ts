import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../domain/entities/Client.entity';
import { ClientNotFoundError } from '../../../common/domain/errors';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';

@Injectable()
export class UpdateClientUsecase implements UseCase {
  constructor(
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}
  async execute(
    clientId: string,
    organizationId: string,
    name: string,
  ): Promise<Either<DomainError, ClientEntity>> {
    const validation = ClientEntity.validateEdit(
      clientId,
      name,
      organizationId,
    );
    if (validation.isLeft()) return left(validation.value);

    const updatedClient = await this.clientRepository.update(
      clientId,
      organizationId,
      name,
    );

    if (!updatedClient) return left(new ClientNotFoundError());

    return right(updatedClient);
  }
}
