import { OrganizationEntity } from '../entities/Organization.entity';

export interface OrganizationRepository {
  create(name: string, code: string): Promise<OrganizationEntity>;
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
  update(id: string, name?: string, code?: string): Promise<OrganizationEntity>;
  remove(id: string): Promise<void>;
  checkIfUserIsFromOrganization(
    organizationId: string,
    userId: string,
  ): Promise<boolean>;
}

export const OrganizationRepository = Symbol('OrganizationRepository');
