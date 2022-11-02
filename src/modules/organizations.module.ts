import { Module } from '@nestjs/common';
import { TypeOrmOrganizationsRepository } from '../data/typeorm/repositories/TypeOrmOrganizationsRepository';
import { OrganizationRepository } from '../domain/repositories/OrganizationRepository';
import { CreateOrganizationUsecase } from '../interactors/usecases/CreateOrganizationUsecase';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule],
  providers: [
    { provide: CreateOrganizationUsecase, useClass: CreateOrganizationUsecase },
    {
      provide: OrganizationRepository,
      useClass: TypeOrmOrganizationsRepository,
    },
  ],
  exports: [],
})
export class OrganizationsModule {}
