import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from '../data/typeorm/entities/queues';
import { TypeOrmQueuesRepository } from '../data/typeorm/repositories/TypeOrmQueuesRepository';
import { QueueRepository } from '../domain/repositories/QueueRepository';
import { AttachClientToQueueUsecase } from '../interactors/usecases/AttachClientToQueueUsecase';
import { AttachGroupsToQueueUsecase } from '../interactors/usecases/AttachGroupsToQueueUsecase';
import { CallNextClientOfQueueUsecase } from '../interactors/usecases/CallNextClientOfQueueUsecase';
import { CreateQueueUsecase } from '../interactors/usecases/CreateQueueUsecase';
import { FindOneOrAllQueuesUsecase } from '../interactors/usecases/FindOneOrAllQueuesUsecase';
import { FindQueueByIdUsecase } from '../interactors/usecases/FindQueueByIdUsecase';
import { QueueController } from '../presentation/http/controllers/v1/QueueController';
import { AuthenticationMiddleware } from '../presentation/http/middleware/AuthenticationMiddleware';
import { ClientsModule } from './clients.module';
import { CommonModule } from './common.module';
import { OrganizationsModule } from './organizations.module';
import { GroupsModule } from './groups.module';

@Module({
  imports: [
    forwardRef(() => OrganizationsModule),
    forwardRef(() => ClientsModule),
    forwardRef(() => GroupsModule),
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
      provide: AttachClientToQueueUsecase,
      useClass: AttachClientToQueueUsecase,
    },
    {
      provide: FindQueueByIdUsecase,
      useClass: FindQueueByIdUsecase,
    },
    {
      provide: CallNextClientOfQueueUsecase,
      useClass: CallNextClientOfQueueUsecase,
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
          path: 'v1/queues/enter',
          method: RequestMethod.PATCH,
        },
        {
          path: 'v1/queues/:queueId',
          method: RequestMethod.GET,
        },
      )
      .forRoutes({ path: 'v1/queues*', method: RequestMethod.ALL });
  }
}
