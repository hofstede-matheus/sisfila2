import { DeskEntity } from '../entities/Desk.entity';

export interface DeskRepository {
  create(name: string, organizationId: string): Promise<DeskEntity>;
}

export const DeskRepository = Symbol('DeskRepository');
