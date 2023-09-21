import { GroupEntity } from '../entities/Group.entity';

export interface GroupRepository {
  findByOrganizationId(organizationId: string): Promise<GroupEntity[]>;
  create(name: string, organizationId: string): Promise<GroupEntity>;
  attachClientsToGroup(groupId: string, clientsIds: string[]): Promise<void>;
  removeAllClientsFromGroup(groupId: string): Promise<void>;
  findGroupsByQueueId(queueId: string): Promise<GroupEntity[]>;
  update(id: string, name: string): Promise<GroupEntity>;
  remove(id: string): Promise<void>;
}

export const GroupRepository = Symbol('GroupRepository');
