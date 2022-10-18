import { Module } from '@nestjs/common';
import { EncryptionService } from '../domain/services/EncryptionService';

@Module({
  providers: [
    {
      provide: EncryptionService,
      useValue: {
        check: () => Promise.resolve(true),
        encrypt: () => Promise.resolve('valid_hash'),
      } as EncryptionService,
    },
  ],
})
export class CommonModule {}
