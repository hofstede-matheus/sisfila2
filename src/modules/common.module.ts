import { Module } from '@nestjs/common';
import { BcryptEncryptionService } from '../data/services/BcryptEncryptionService';
import { GoogleOAuthAuthenticationService } from '../data/services/GoogleOAuthAuthenticationService';
import { JWTAuthService } from '../data/services/JWTAuthService';
import { AuthenticationService } from '../domain/services/AuthenticationService';
import { EncryptionService } from '../domain/services/EncryptionService';
import { OAuthAuthenticationService } from '../domain/services/OAuthAuthenticationService';

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
      provide: OAuthAuthenticationService,
      useClass: GoogleOAuthAuthenticationService,
    },
  ],
  exports: [
    EncryptionService,
    AuthenticationService,
    OAuthAuthenticationService,
  ],
})
export class CommonModule {}
