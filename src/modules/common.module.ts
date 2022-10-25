import { Module } from '@nestjs/common';
import { BcryptEncryptionService } from '../data/services/BcryptEncryptionService';
import { GoogleOAuthService } from '../data/services/GoogleOAuthService';
import { JWTAuthService } from '../data/services/JWTAuthService';
import { AuthenticationService } from '../domain/services/AuthenticationService';
import { EncryptionService } from '../domain/services/EncryptionService';
import { OAuthService } from '../domain/services/OAuthService';

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
      useClass: GoogleOAuthService,
    },
  ],
  exports: [EncryptionService, AuthenticationService, OAuthService],
})
export class CommonModule {}
