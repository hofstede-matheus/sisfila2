import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../data/typeorm/entities/clients';
import { TypeOrmClientsRepository } from '../data/typeorm/repositories/TypeOrmClientsRepository';
import { ClientRepository } from '../domain/repositories/ClientRepository';
import { CreateClientUsecase } from '../interactors/usecases/CreateClientUsecase';
import { FindOneOrAllClientsUsecase } from '../interactors/usecases/FindOneOrAllClientsUsecase';
import { ClientController } from '../presentation/http/controllers/v1/ClientController';
import { AuthenticationMiddleware } from '../presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from './common.module';
import { UsersModule } from './users.module';

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
