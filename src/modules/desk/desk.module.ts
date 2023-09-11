import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { DeskController } from './presentation/http/controllers/DeskController';
import { CreateDeskUsecase } from './interactors/usecases/CreateDeskUsecase';
import { DeskRepository } from './domain/repositories/DeskRepository';
import { TypeOrmDesksRepository } from './data/typeorm/repositories/TypeOrmDesksRepository';
import { Desk } from './data/typeorm/entities/desks.typeorm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindOneOrAllDesksUsecase } from './interactors/usecases/FindOneOrAllDesksUsecase';
import { RemoveDeskUsecase } from './interactors/usecases/RemoveDeskUsecase';
import { UpdateDeskUsecase } from './interactors/usecases/UpdateDeskUsecase';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Desk])],
  controllers: [DeskController],
  providers: [
    { provide: DeskRepository, useClass: TypeOrmDesksRepository },
    { provide: CreateDeskUsecase, useClass: CreateDeskUsecase },
    { provide: FindOneOrAllDesksUsecase, useClass: FindOneOrAllDesksUsecase },
    { provide: RemoveDeskUsecase, useClass: RemoveDeskUsecase },
    { provide: UpdateDeskUsecase, useClass: UpdateDeskUsecase },
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
