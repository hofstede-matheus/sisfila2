import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
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

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Client]), UsersModule],
  controllers: [ClientController],
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
  ],
  exports: [ClientRepository],
})
export class ClientsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'v1/clients*', method: RequestMethod.ALL });
  }
}
