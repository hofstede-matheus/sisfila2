import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { DeskController } from './presentation/http/controllers/DeskController';
import { CreateDeskUsecase } from './interactors/usecases/CreateDeskUsecase';
import { DeskRepository } from './domain/repositories/DeskRepository';
import { TypeOrmDesksRepository } from './data/typeorm/repositories/TypeOrmDesksRepository';
import { Desk } from './data/typeorm/entities/desks.typeorm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoveDeskUsecase } from './interactors/usecases/RemoveDeskUsecase';
import { UpdateDeskUsecase } from './interactors/usecases/UpdateDeskUsecase';
import { CallNextClientOfDeskUsecase } from './interactors/usecases/CallNextClientOfDeskUsecase';
import { ServicesModule } from '../services/services.module';
import { QueuesModule } from '../queues/queues.module';
import { ClientsModule } from '../clients/clients.module';
import { FindOneDeskFromOrganizationUsecase } from './interactors/usecases/FindOneDeskFromOrganizationUsecase';
import { FindAllDesksFromOrganizationUsecase } from './interactors/usecases/FindAllDesksFromOrganizationUsecase';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => ServicesModule),
    forwardRef(() => QueuesModule),
    forwardRef(() => ClientsModule),
    TypeOrmModule.forFeature([Desk]),
  ],
  controllers: [DeskController],
  providers: [
    { provide: DeskRepository, useClass: TypeOrmDesksRepository },
    { provide: CreateDeskUsecase, useClass: CreateDeskUsecase },
    {
      provide: FindOneDeskFromOrganizationUsecase,
      useClass: FindOneDeskFromOrganizationUsecase,
    },
    {
      provide: FindAllDesksFromOrganizationUsecase,
      useClass: FindAllDesksFromOrganizationUsecase,
    },
    { provide: RemoveDeskUsecase, useClass: RemoveDeskUsecase },
    { provide: UpdateDeskUsecase, useClass: UpdateDeskUsecase },
    {
      provide: CallNextClientOfDeskUsecase,
      useClass: CallNextClientOfDeskUsecase,
    },
  ],
  exports: [DeskRepository],
})
export class DesksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'v1/desks*', method: RequestMethod.ALL });
  }
}
