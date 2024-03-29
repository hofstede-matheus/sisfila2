import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './data/typeorm/entities/clients.typeorm-entity';
import { TypeOrmClientsRepository } from './data/typeorm/repositories/TypeOrmClientsRepository';
import { ClientRepository } from './domain/repositories/ClientRepository';
import { CreateClientUsecase } from './interactors/usecases/CreateClientUsecase';
import { FindOneOrAllClientsUsecase } from './interactors/usecases/FindOneOrAllClientsUsecase';
import { RemoveClientUsecase } from './interactors/usecases/RemoveClientUsecase';
import { ClientController } from './presentation/http/controllers/v1/ClientController';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { UpdateClientUsecase } from './interactors/usecases/UpdateClientUsecase';
import { AddTokenToClientUsecase } from './interactors/usecases/AddTokenToClientUsecase';
import { SubscribeToQueueUsecase } from './interactors/usecases/SubscribeToQueueUsecase';
import { ClientNotificationController } from './presentation/http/controllers/v1/ClientNotificationController';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationsModule),
    TypeOrmModule.forFeature([Client]),
  ],
  controllers: [ClientController, ClientNotificationController],
  providers: [
    {
      provide: ClientRepository,
      useClass: TypeOrmClientsRepository,
    },
    {
      provide: CreateClientUsecase,
      useClass: CreateClientUsecase,
    },
    {
      provide: FindOneOrAllClientsUsecase,
      useClass: FindOneOrAllClientsUsecase,
    },
    {
      provide: RemoveClientUsecase,
      useClass: RemoveClientUsecase,
    },
    { provide: UpdateClientUsecase, useClass: UpdateClientUsecase },
    { provide: AddTokenToClientUsecase, useClass: AddTokenToClientUsecase },
    { provide: SubscribeToQueueUsecase, useClass: SubscribeToQueueUsecase },
  ],
  exports: [ClientRepository],
})
export class ClientsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        {
          path: 'v1/clients/notification/:registrationId/organizations/:organizationId',
          method: RequestMethod.PATCH,
        },
        {
          path: 'v1/clients/notification/subscribe',
          method: RequestMethod.PATCH,
        },
        {
          path: 'v1/clients/notification/unsubscribe',
          method: RequestMethod.PATCH,
        },
      )
      .forRoutes({ path: 'v1/clients*', method: RequestMethod.ALL });
  }
}
