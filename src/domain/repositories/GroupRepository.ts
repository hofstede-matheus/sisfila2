import { GroupEntity } from '../entities/Group.entity';

export interface GroupRepository {
  findByOrganizationId(organizationId: string): Promise<GroupEntity[]>;
  create(name: string, organizationId: string): Promise<string>;
  attachClientsToGroup(groupId: string, clientsIds: string[]): Promise<void>;
  removeAllClientsFromGroup(groupId: string): Promise<void>;
  findGroupsByQueueId(queueId: string): Promise<GroupEntity[]>;
}

export const GroupRepository = Symbol('GroupRepository');
