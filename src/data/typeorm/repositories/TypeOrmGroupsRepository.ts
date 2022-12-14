import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../../domain/entities/Client.entity';
import { GroupEntity } from '../../../domain/entities/Group.entity';
import { GroupRepository } from '../../../domain/repositories/GroupRepository';
import { Group } from '../entities/groups';
import { Queue } from '../entities/queues';

export class TypeOrmGroupsRepository implements GroupRepository {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}

  async attachClientsToGroup(
    groupId: string,
    clientsIds: string[],
  ): Promise<void> {
    for (const clientId of clientsIds) {
      await this.groupsRepository.query(
        `INSERT INTO clients_in_groups (client_id, group_id) VALUES ($1, $2)`,
        [clientId, groupId],
      );
    }
  }

  async findByOrganizationId(organizationId: string): Promise<GroupEntity[]> {
    // const queryBuilder = this.groupsRepository
    //   .createQueryBuilder('groups')
    //   .leftJoin('clients_in_groups', 'cig', 'cig.group_id = groups.id')
    //   .leftJoin('clients', 'cli', 'cli.id = cig.client_id')
    //   .where('groups.organization_id = :organizationId', { organizationId });

    // const groups = await queryBuilder.getMany();

    const groupsFromDatabase = await this.groupsRepository.query(
      `
      SELECT groups.id, groups.name, groups.organization_id, groups.created_at, groups.updated_at, cli.id as client_id, cli.name as client_name, cli.organization_id as client_organization_id, cli.created_at as client_created_at, cli.updated_at as client_updated_at
      FROM groups
      LEFT JOIN clients_in_groups cig ON cig.group_id = groups.id
      LEFT JOIN clients cli ON cli.id = cig.client_id
      WHERE groups.organization_id = $1
    `,
      [organizationId],
    );

    const mapOfUniqueGroups = new Map();
    groupsFromDatabase.forEach((element) => {
      mapOfUniqueGroups.set(element.id, {
        id: element.id,
        name: element.name,
        organization_id: element.organization_id,
        createdAt: element.created_at,
        updatedAt: element.updated_at,
        clients: [],
      } as Group);
    });
    groupsFromDatabase.forEach((element) => {
      const newGroup = mapOfUniqueGroups.get(element.id);
      if (element.client_id === null) {
        return;
      }
      newGroup.clients.push({
        id: element.client_id,
        name: element.client_name,
        organizationId: element.client_organization_id,
        createdAt: element.client_created_at,
        updatedAt: element.client_updated_at,
      });
      mapOfUniqueGroups.set(element.id, newGroup);
    });

    const groups = Array.from(mapOfUniqueGroups.values());

    const mappedGroups: GroupEntity[] = groups.map((group) => {
      return {
        id: group.id,
        name: group.name,
        clients: group.clients,
        organizationId: group.organization_id,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    });

    return mappedGroups;
  }
  async create(name: string, organizationId: string): Promise<string> {
    const groupEntity = this.groupsRepository.create({
      name,
      organization_id: organizationId,
    });

    const groupInDatabase = await this.groupsRepository.save(groupEntity);

    return groupInDatabase.id;
  }
}
