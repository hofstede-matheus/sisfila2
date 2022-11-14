import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../data/typeorm/entities/organizations';
import { TypeOrmOrganizationsRepository } from '../data/typeorm/repositories/TypeOrmOrganizationsRepository';
import { OrganizationRepository } from '../domain/repositories/OrganizationRepository';
import { ServiceRepository } from '../domain/repositories/ServiceRepository';
import { CreateOrganizationUsecase } from '../interactors/usecases/CreateOrganizationUsecase';
import { FindOneOrAllOrganizationsUsecase } from '../interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { RemoveOrganizationUsecase } from '../interactors/usecases/RemoveOrganizationUsecase';
import { UpdateOrganizationUsecase } from '../interactors/usecases/UpdateOrganizationUsecase';
import { OrganizationController } from '../presentation/http/controllers/OrganizationController';
import { CommonModule } from './common.module';
import { GroupsModule } from './groups.module';
import { QueuesModule } from './queues.module';
import { ServicesModule } from './services.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Organization]),
    ServicesModule,
    QueuesModule,
    GroupsModule,
  ],
  controllers: [OrganizationController],
  providers: [
    { provide: CreateOrganizationUsecase, useClass: CreateOrganizationUsecase },
    { provide: UpdateOrganizationUsecase, useClass: UpdateOrganizationUsecase },
    {
      provide: FindOneOrAllOrganizationsUsecase,
      useClass: FindOneOrAllOrganizationsUsecase,
    },
    {
      provide: RemoveOrganizationUsecase,
      useClass: RemoveOrganizationUsecase,
    },
    {
      provide: OrganizationRepository,
      useClass: TypeOrmOrganizationsRepository,
    },
  ],
  exports: [OrganizationRepository],
})
export class OrganizationsModule {}
