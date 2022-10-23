import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/User.entity';
import { InvalidOauthDataError } from '../../domain/errors';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { OauthAuthenticationService } from '../../domain/services/OAuthAuthenticationService';
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

    @Inject(OauthAuthenticationService)
    private oauthAuthenticationService: OauthAuthenticationService,
  ) {}

  async execute(
    oauthToken: string,
    audience: string,
  ): Promise<Either<DomainError, string>> {
    if (
      oauthToken === '' ||
      audience === '' ||
      oauthToken === undefined ||
      audience === undefined
    )
      return Promise.resolve(left(new InvalidOauthDataError()));

    const userData = await this.oauthAuthenticationService.getUserProfile(
      oauthToken,
      audience,
    );

    if (!userData) return Promise.resolve(left(new InvalidOauthDataError()));

    const userId = async () => {
      const user = await this.userRepository.findByEmail(userData.email);

      if (!user) {
        const newUserId = await this.userRepository.createV2(
          userData.name,
          userData.email,
        );

        return newUserId;
      }
      return user.id;
    };

    const token = this.authenticationService.generate(await userId());

    return right(token);
  }
}
