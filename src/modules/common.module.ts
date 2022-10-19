import { Module } from '@nestjs/common';
import { BcryptEncryptionService } from '../data/services/BcryptEncryptionService';
import { JWTAuthService } from '../data/services/JWTAuthService';
import { AuthenticationService } from '../domain/services/AuthenticationService';
import { EncryptionService } from '../domain/services/EncryptionService';

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
  ],
  exports: [EncryptionService, AuthenticationService],
})
export class CommonModule {}
