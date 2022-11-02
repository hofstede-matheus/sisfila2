import { OrganizationEntity } from '../entities/Organization.entity';

export interface OrganizationRepository {
  create(
    name: string,
    email: string,
    code: string,
  ): Promise<OrganizationEntity>;
  findByCode(email: string): Promise<OrganizationEntity | undefined>;
}

export const OrganizationRepository = Symbol('OrganizationRepository');
