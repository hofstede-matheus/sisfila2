import { Inject, Injectable } from '@nestjs/common';
import { ClientEntity } from '../../domain/entities/Client.entity';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { GroupRepository } from '../../domain/repositories/GroupRepository';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { Validator } from '../../shared/helpers/validator';

@Injectable()
export class ImportClientsToGroupUsecase implements UseCase {
  constructor(
    @Inject(GroupRepository)
    private groupRepository: GroupRepository,
    // @Inject(OrganizationRepository)
    // private organizationRepository: OrganizationRepository,
    @Inject(ClientRepository)
    private clientRepository: ClientRepository,
  ) {}
  async execute(
    userId: string,
    groupId: string,
    organizationId: string,
    clients: ClientEntity[],
  ): Promise<Either<DomainError, void>> {
    const validation = Validator.validate({
      id: [userId, groupId],
    });
    if (validation.isLeft()) return left(validation.value);

    const newClientsToGroup: ClientEntity[] = [];
    const newClientsIds: string[] = [];

    for (const client of clients) {
      const entityValidation = ClientEntity.build(
        client.name,
        client.organizationId,
        client.registrationId,
      );
      if (entityValidation.isLeft()) return left(entityValidation.value);
      const clientInDatabase =
        await this.clientRepository.findByRegistrationIdFromOrganization(
          client.organizationId,
          client.registrationId,
        );

      if (!clientInDatabase) {
        newClientsToGroup.push(client);
      }
    }

    for (const client of newClientsToGroup) {
      const newClient = await this.clientRepository.create(
        client.name,
        client.organizationId,
        client.registrationId,
      );
      newClientsIds.push(newClient.id);
    }

    // TODO - remove newly created clients from this list
    const clientsIdsInDatabase =
      await this.clientRepository.findManyIdsByRegistrationIds(
        clients.map((client) => client.registrationId),
      );

    await this.groupRepository.attachClientsToGroup(groupId, [
      ...newClientsIds,
      ...clientsIdsInDatabase,
    ]);

    return right();
  }
}
