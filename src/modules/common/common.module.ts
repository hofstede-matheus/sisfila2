import { Module } from '@nestjs/common';
import { AuthenticationService } from '../users/domain/services/AuthenticationService';
import { BcryptEncryptionService } from '../users/data/services/BcryptjsEncryptionService';
import { GoogleOauthAuthenticationService } from '../users/data/services/GoogleOauthAuthenticationService';
import { JWTAuthService } from '../users/data/services/JWTAuthService';
import { EncryptionService } from '../users/domain/services/EncryptionService';
import { OAuthService } from '../users/domain/services/OauthAuthenticationService';

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
      provide: OAuthService,
      useClass: GoogleOauthAuthenticationService,
    },
  ],
  exports: [EncryptionService, AuthenticationService, OAuthService],
})
export class CommonModule {}
