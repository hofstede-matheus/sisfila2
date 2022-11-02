import { Module } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/UserRepository';
import { CreateOrganizationUsecase } from '../interactors/usecases/CreateOrganizationUsecase';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule],
  providers: [
    { provide: CreateOrganizationUsecase, useClass: CreateOrganizationUsecase },
  ],
  exports: [UserRepository],
})
export class OrganizationsModule {}
