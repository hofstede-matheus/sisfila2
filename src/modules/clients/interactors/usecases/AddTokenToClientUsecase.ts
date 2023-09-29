import { Inject, Injectable } from '@nestjs/common';
import { ClientNotFoundError } from '../../../common/domain/errors';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';

@Injectable()
export class AddTokenToClientUsecase implements UseCase {
  constructor(
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}
  async execute(
    registrationId: string,
    organizationId: string,
    token: string,
  ): Promise<Either<DomainError, void>> {
    const client =
      await this.clientRepository.findByRegistrationIdFromOrganization(
        registrationId,
        organizationId,
      );

    if (!client) return left(new ClientNotFoundError());

    await this.clientRepository.addTokenToClient(client.id, token);
    return right();
  }
}
