import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../data/typeorm/entities/services';
import { TypeOrmServicesRepository } from '../data/typeorm/repositories/TypeOrmServicesRepository';
import { ServiceRepository } from '../domain/repositories/ServiceRepository';
import { FindOneOrAllServicesUsecase } from '../interactors/usecases/FindOneOrAllServicesUsecase';
import { ServiceController } from '../presentation/http/controllers/v1/ServiceController';
import { AuthenticationMiddleware } from '../presentation/http/middleware/AuthenticationMiddleware';
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
export class ServicesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'v1/services', method: RequestMethod.ALL });
  }
}
