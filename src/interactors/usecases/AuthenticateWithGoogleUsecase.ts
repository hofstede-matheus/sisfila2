import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../modules/users/domain/entities/User.entity';
import { InvalidOauthDataError } from '../../domain/errors';
import { UserRepository } from '../../modules/users/domain/repositories/UserRepository';
import { AuthenticationService } from '../../modules/users/domain/services/AuthenticationService';
import { Either, left, right } from '../../shared/helpers/either';
import { DomainError } from '../../shared/helpers/errors';
import { UseCase } from '../../shared/helpers/usecase';
import { OAuthService } from '../../modules/users/domain/services/OauthAuthenticationService';

@Injectable()
export class AuthenticateWithGoogleUsecase implements UseCase {
  constructor(
    @Inject(UserRepository)
    private userRepository: UserRepository,

    @Inject(AuthenticationService)
    private authenticationService: AuthenticationService,

    @Inject(OAuthService)
    private oAuthService: OAuthService,
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

    const userData = await this.oAuthService.getUserProfile(
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
