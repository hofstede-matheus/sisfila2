import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './data/typeorm/entities/services.typeorm-entity';
import { TypeOrmServicesRepository } from './data/typeorm/repositories/TypeOrmServicesRepository';
import { ServiceRepository } from './domain/repositories/ServiceRepository';
import { CreateServiceUsecase } from './interactors/usecases/CreateServiceUsecase';
import { FindOneOrAllServicesUsecase } from './interactors/usecases/FindOneOrAllServicesUsecase';
import { ServiceController } from './presentation/http/controllers/ServiceController';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from '../common/common.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    forwardRef(() => OrganizationsModule),
    CommonModule,
    TypeOrmModule.forFeature([Service]),
  ],
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
    {
      provide: CreateServiceUsecase,
      useClass: CreateServiceUsecase,
    },
  ],
  exports: [ServiceRepository],
})
export class ServicesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'v1/services*', method: RequestMethod.ALL });
  }
}
