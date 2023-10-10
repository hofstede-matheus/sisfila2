import { ClientEntity } from '../../../clients/domain/entities/Client.entity';
import { ClientInQueue } from '../../../queues/domain/entities/Queue.entity';
import { DeskEntity } from '../entities/Desk.entity';

export interface DeskRepository {
  create(name: string, organizationId: string): Promise<DeskEntity>;
  findAllByOrganizationId(organizationId: string): Promise<DeskEntity[]>;
  removeFromOrganization(id: string): Promise<void>;
  update(
    id: string,
    name: string,
    attendantId: string,
    services: string[],
  ): Promise<DeskEntity>;
  findById(id: string): Promise<DeskEntity>;
  getLastClientCalledFromDesk(deskId: string): Promise<ClientInQueue>;
}

export const DeskRepository = Symbol('DeskRepository');
