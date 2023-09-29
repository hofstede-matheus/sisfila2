import { Module } from '@nestjs/common';
import { AuthenticationService } from './domain/services/AuthenticationService';
import { BcryptEncryptionService } from './data/services/BcryptjsEncryptionService';
import { GoogleOauthAuthenticationService } from './data/services/GoogleOauthAuthenticationService';
import { JWTAuthService } from './data/services/JWTAuthService';
import { EncryptionService } from './domain/services/EncryptionService';
import { OAuthService } from './domain/services/OauthAuthenticationService';
import { EmailService } from './domain/services/EmailService';
import { TwillioEmailService } from './data/services/TwillioEmailService';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './domain/services/NotificationService';
import { FirebaseNotificationService } from './data/services/FirebaseNotificationService';

@Module({
  imports: [ConfigModule],
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
    {
      provide: EmailService,
      useClass: TwillioEmailService,
    },
    {
      provide: NotificationService,
      useClass: FirebaseNotificationService,
    },
  ],
  exports: [
    EncryptionService,
    AuthenticationService,
    OAuthService,
    EmailService,
    NotificationService,
  ],
})
export class CommonModule {}
