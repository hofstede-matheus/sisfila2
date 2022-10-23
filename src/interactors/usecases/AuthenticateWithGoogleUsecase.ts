import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { OauthAuthenticationService } from '../../domain/services/OAuthAuthenticationService';
import { Either } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class AuthenticateWithGoogleUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,

    @Inject(AuthenticationService)
    private authenticationService: AuthenticationService,

    @Inject(OauthAuthenticationService)
    private oauthAuthenticationService: OauthAuthenticationService,
  ) {}

  execute(
    oauthToken: string,
    audience: string,
  ): Promise<Either<DomainError, any>> {
    throw new Error('Method not implemented.');
  }
}
