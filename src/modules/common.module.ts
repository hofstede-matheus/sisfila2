import { Module } from '@nestjs/common';
import { BcryptEncryptionService } from '../data/services/BcryptEncryptionService';
import { GoogleOauthAuthenticationService } from '../data/services/GoogleOauthAuthenticationService';
import { JWTAuthService } from '../data/services/JWTAuthService';
import { AuthenticationService } from '../domain/services/AuthenticationService';
import { EncryptionService } from '../domain/services/EncryptionService';
import { OauthAuthenticationService } from '../domain/services/OAuthAuthenticationService';

@Module({
  providers: [
    {
      provide: EncryptionService,
      useClass: BcryptEncryptionService,
    },
    {
      provide: AuthenticationService,
      useClass: JWTAuthService,
    },
    {
      provide: OauthAuthenticationService,
      useClass: GoogleOauthAuthenticationService,
    },
  ],
  exports: [
    EncryptionService,
    AuthenticationService,
    OauthAuthenticationService,
  ],
})
export class CommonModule {}
