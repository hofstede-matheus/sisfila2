import { Injectable } from '@nestjs/common';
import { AuthorizationService } from '../../domain/services/AuthorizationService';

@Injectable()
export class AuthorizationServiceImpl implements AuthorizationService {
  checkIfUserHasRightsInOrganization(
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
