import { GroupEntity } from '../entities/Group.entity';

export interface GroupRepository {
  findByOrganizationId(
    organizationId: string,
  ): Promise<GroupEntity | undefined>;
}

export const GroupRepository = Symbol('GroupRepository');
