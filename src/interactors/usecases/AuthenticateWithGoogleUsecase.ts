import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { InvalidOauthDataError } from '../../domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { OAuthService } from '../../domain/services/OauthAuthenticationService';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';

@Injectable()
export class AuthenticateWithGoogleUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,

    @Inject(AuthenticationService)
    private authenticationService: AuthenticationService,

    @Inject(OAuthService)
    private OAuthService: OAuthService,
  ) {}

  async execute(
    oauthToken: string,
    audience: string,
  ): Promise<Either<DomainError, { token: string; user: UserEntity }>> {
    if (
      oauthToken === '' ||
      audience === '' ||
      oauthToken === undefined ||
      audience === undefined
    )
      return Promise.resolve(left(new InvalidOauthDataError()));

    const userData = await this.OAuthService.getUserProfile(
      oauthToken,
      audience,
    );

    if (!userData) return Promise.resolve(left(new InvalidOauthDataError()));

    let user = await this.userRepository.findByEmail(userData.email);

    if (!user) {
      user = await this.userRepository.create(userData.name, userData.email);
    }

    const token = this.authenticationService.generate(user.id);

    return right({
      token,
      user,
    });
  }
}
