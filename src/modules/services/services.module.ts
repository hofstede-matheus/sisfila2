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
import { AttachClientToServiceUsecase } from './interactors/usecases/AttachClientToServiceUsecase';
import { ClientsModule } from '../clients/clients.module';
import { QueuesModule } from '../queues/queues.module';
import { AdminServiceController } from './presentation/http/controllers/AdminServiceController';
import { RemoveServiceUsecase } from './interactors/usecases/RemoveServiceUsecase';
import { UpdateServiceUsecase } from './interactors/usecases/UpdateServiceUsecase';
import { GetClientPositionInServiceUsecase } from '../queues/interactors/usecases/GetClientPositionInQueueUsecase';

@Module({
  imports: [
    forwardRef(() => OrganizationsModule),
    forwardRef(() => ClientsModule),
    forwardRef(() => QueuesModule),
    CommonModule,
    TypeOrmModule.forFeature([Service]),
  ],
  controllers: [ServiceController, AdminServiceController],
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
    {
      provide: AttachClientToServiceUsecase,
      useClass: AttachClientToServiceUsecase,
    },
    {
      provide: RemoveServiceUsecase,
      useClass: RemoveServiceUsecase,
    },
    {
      provide: UpdateServiceUsecase,
      useClass: UpdateServiceUsecase,
    },
    {
      provide: GetClientPositionInServiceUsecase,
      useClass: GetClientPositionInServiceUsecase,
    },
  ],
  exports: [ServiceRepository],
})
export class ServicesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        {
          path: 'v1/services/enter',
          method: RequestMethod.PATCH,
        },
        {
          path: 'v1/services/organizations/:id',
          method: RequestMethod.GET,
        },
        {
          path: 'v1/services/:queueId/position/:registrationId',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(
        { path: 'v1/services*', method: RequestMethod.ALL },
        { path: 'v1/admin/services*', method: RequestMethod.ALL },
      );
  }
}
