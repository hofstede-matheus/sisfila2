import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../data/typeorm/entities/services';
import { TypeOrmOrganizationsRepository } from '../data/typeorm/repositories/TypeOrmOrganizationsRepository';
import { TypeOrmServicesRepository } from '../data/typeorm/repositories/TypeOrmServicesRepository';
import { ServiceRepository } from '../domain/repositories/ServiceRepository';
import { FindOneOrAllServicesUsecase } from '../interactors/usecases/FindOneOrAllServicesUsecase';
import { ServiceController } from '../presentation/http/controllers/ServiceController';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Service])],
  controllers: [ServiceController],
  providers: [
    {
      provide: ServiceRepository,
      useClass: TypeOrmServicesRepository,
    },
    {
      provide: FindOneOrAllServicesUsecase,
      useClass: FindOneOrAllServicesUsecase,
    },
  ],
  exports: [ServiceRepository],
})
export class ServicesModule {}
