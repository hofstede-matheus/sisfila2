import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from './data/typeorm/entities/queues.typeorm-entity';
import { TypeOrmQueuesRepository } from './data/typeorm/repositories/TypeOrmQueuesRepository';
import { QueueRepository } from './domain/repositories/QueueRepository';
import { UpdateQueueUsecase } from './interactors/usecases/UpdateQueueUsecase';
import { CreateQueueUsecase } from './interactors/usecases/CreateQueueUsecase';
import { FindOneOrAllQueuesUsecase } from './interactors/usecases/FindOneOrAllQueuesUsecase';
import { FindQueueByIdUsecase } from './interactors/usecases/FindQueueByIdUsecase';
import { QueueController } from './presentation/http/controllers/QueueController';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { ClientsModule } from '../clients/clients.module';
import { CommonModule } from '../common/common.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RemoveQueueUsecase } from './interactors/usecases/RemoveQueueUsecase';

@Module({
  imports: [
    forwardRef(() => OrganizationsModule),
    forwardRef(() => ClientsModule),

    CommonModule,
    TypeOrmModule.forFeature([Queue]),
  ],
  controllers: [QueueController],
  providers: [
    {
      provide: QueueRepository,
      useClass: TypeOrmQueuesRepository,
    },
    {
      provide: FindOneOrAllQueuesUsecase,
      useClass: FindOneOrAllQueuesUsecase,
    },
    {
      provide: CreateQueueUsecase,
      useClass: CreateQueueUsecase,
    },
    {
      provide: UpdateQueueUsecase,
      useClass: UpdateQueueUsecase,
    },
    {
      provide: FindQueueByIdUsecase,
      useClass: FindQueueByIdUsecase,
    },
    {
      provide: RemoveQueueUsecase,
      useClass: RemoveQueueUsecase,
    },
  ],
  exports: [QueueRepository],
})
export class QueuesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude({
        path: 'v1/queues/:queueId',
        method: RequestMethod.GET,
      })
      .forRoutes({ path: 'v1/queues*', method: RequestMethod.ALL });
  }
}
