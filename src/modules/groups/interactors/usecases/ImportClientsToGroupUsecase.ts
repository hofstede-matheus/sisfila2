import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../../clients/domain/entities/Client.entity';
import { ClientRepository } from '../../../clients/domain/repositories/ClientRepository';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { Either, left, right } from '../../../common/shared/helpers/either';
import { DomainError } from '../../../common/shared/helpers/errors';
import { UseCase } from '../../../common/shared/helpers/usecase';
import { Validator } from '../../../common/shared/helpers/validator';

@Injectable()
export class ImportClientsToGroupUsecase implements UseCase {
  constructor(
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}

  async execute(
    userId: string,
    groupId: string,
    organizationId: string,
    clients: { name: string; registrationId: string }[],
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [userId, groupId, organizationId],
    });
    if (validation.isLeft()) return left(validation.value);

    const clientsWithUniqueRegistrationId = clients.filter(
      (client, index, self) =>
        index ===
        self.findIndex((t) => t.registrationId === client.registrationId),
    );

    const newClients: ClientEntity[] = [];
    const clientsInDatabase: { client: ClientEntity; isNameEdited: boolean }[] =
      [];

    for (const client of clientsWithUniqueRegistrationId) {
      const entityValidation = ClientEntity.build(
        client.name,
        organizationId,
        client.registrationId,
      );
      if (entityValidation.isLeft()) return left(entityValidation.value);
      const clientInDatabase =
        await this.clientRepository.findByRegistrationIdFromOrganization(
          organizationId,
          client.registrationId,
        );

      if (!clientInDatabase) {
        newClients.push(entityValidation.value);
      } else {
        clientsInDatabase.push({
          client: {
            ...clientInDatabase,
            name: client.name,
          },
          isNameEdited: clientInDatabase.name !== client.name,
        });
      }
    }

    const newClientIds = [];

    for (const client of newClients) {
      const newClient = await this.clientRepository.create(
        client.name,
        organizationId,
        client.registrationId,
      );
      newClientIds.push(newClient.id);
    }

    for (const client of clientsInDatabase) {
      if (client.isNameEdited) {
        await this.clientRepository.update(
          client.client.id,
          client.client.organizationId,
          client.client.name,
        );
      }
    }

    await this.groupRepository.removeAllClientsFromGroup(groupId);

    await this.groupRepository.attachClientsToGroup(groupId, [
      ...newClientIds,
      ...clientsInDatabase.map((client) => client.client.id),
    ]);

    return right();
  }
}
