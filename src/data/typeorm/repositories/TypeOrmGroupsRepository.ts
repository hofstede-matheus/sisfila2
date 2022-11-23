import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from '../../../domain/entities/Group.entity';
import { GroupRepository } from '../../../domain/repositories/GroupRepository';
import { Group } from '../entities/groups';
import { Queue } from '../entities/queues';

export class TypeOrmGroupsRepository implements GroupRepository {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
  ) {}
  async findByOrganizationId(organizationId: string): Promise<GroupEntity[]> {
    const groups = await this.groupsRepository.find({
      where: { organization_id: organizationId },
    });

    const mappedGroups: GroupEntity[] = groups.map((group: Queue) => {
      return {
        id: group.id,
        name: group.name,
        code: group.code,
        priority: group.priority,
        description: group.description,
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
