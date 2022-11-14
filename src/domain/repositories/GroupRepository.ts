import { GroupEntity } from '../entities/Group.entity';

export interface GroupRepository {
  findByOrganizationId(organizationId: string): Promise<GroupEntity[]>;
  create(name: string, organizationId: string): Promise<string>;
}

export const GroupRepository = Symbol('GroupRepository');
