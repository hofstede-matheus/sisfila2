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
import { AttachGroupsToQueueUsecase } from './interactors/usecases/AttachGroupsToQueueUsecase';
import { CreateQueueUsecase } from './interactors/usecases/CreateQueueUsecase';
import { FindOneOrAllQueuesUsecase } from './interactors/usecases/FindOneOrAllQueuesUsecase';
import { FindQueueByIdUsecase } from './interactors/usecases/FindQueueByIdUsecase';
import { QueueController } from './presentation/http/controllers/QueueController';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { ClientsModule } from '../clients/clients.module';
import { CommonModule } from '../common/common.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { GetClientPositionInQueueUsecase } from './interactors/usecases/GetClientPositionInQueueUsecase';

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
      provide: AttachGroupsToQueueUsecase,
      useClass: AttachGroupsToQueueUsecase,
    },
    {
      provide: FindQueueByIdUsecase,
      useClass: FindQueueByIdUsecase,
    },
    {
      provide: GetClientPositionInQueueUsecase,
      useClass: GetClientPositionInQueueUsecase,
    },
  ],
  exports: [QueueRepository],
})
export class QueuesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        {
          path: 'v1/queues/:queueId',
          method: RequestMethod.GET,
        },
        {
          path: 'v1/queues/:queueId/position/:registrationId',
          method: RequestMethod.GET,
        },
      )
      .forRoutes({ path: 'v1/queues*', method: RequestMethod.ALL });
  }
}
