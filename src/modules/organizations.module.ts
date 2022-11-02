import { Module } from '@nestjs/common';
import { OrganizationRepository } from '../domain/repositories/OrganizationRepository';
import { CreateOrganizationUsecase } from '../interactors/usecases/CreateOrganizationUsecase';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule],
  providers: [
    { provide: CreateOrganizationUsecase, useClass: CreateOrganizationUsecase },
    {
      provide: OrganizationRepository,
      useValue: {} as OrganizationRepository,
    },
  ],
  exports: [],
})
export class OrganizationsModule {}
