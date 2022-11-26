import { OrganizationEntity } from '../entities/Organization.entity';

export interface OrganizationRepository {
  create(name: string, code: string): Promise<string>;
  findByCode(code: string): Promise<OrganizationEntity | undefined>;
  findOneOrAllByIdAsAdmin({
    organizationId,
  }: {
    organizationId?: string;
  }): Promise<OrganizationEntity[] | undefined>;
  findOneOrAllByIdAsUser({
    organizationId,
    userId,
  }: {
    organizationId?: string;
    userId?: string;
  }): Promise<OrganizationEntity[] | undefined>;
  update(id: string, name?: string, code?: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export const OrganizationRepository = Symbol('OrganizationRepository');
