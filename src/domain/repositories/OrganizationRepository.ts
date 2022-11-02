import { OrganizationEntity } from '../entities/Organization.entity';

export interface OrganizationRepository {
  create(name: string, code: string): Promise<string>;
  findByCode(email: string): Promise<OrganizationEntity | undefined>;
}

export const OrganizationRepository = Symbol('OrganizationRepository');