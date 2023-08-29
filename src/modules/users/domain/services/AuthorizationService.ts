export interface AuthorizationService {
  checkIfUserHasRightsInOrganization(
    userId: string,
    organizationId: string,
  ): Promise<boolean>;
}

export const AuthorizationService = Symbol('AuthorizationService');
