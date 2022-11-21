import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../data/typeorm/entities/groups';
import { TypeOrmGroupsRepository } from '../data/typeorm/repositories/TypeOrmGroupsRepository';
import { GroupRepository } from '../domain/repositories/GroupRepository';
import { FindOneOrAllGroupsUsecase } from '../interactors/usecases/FindOneOrAllGroupsUsecase';
import { GroupController } from '../presentation/http/controllers/v1/GroupController';
import { AuthenticationMiddleware } from '../presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Group])],
  controllers: [GroupController],
  providers: [
    {
      provide: GroupRepository,
      useClass: TypeOrmGroupsRepository,
    },
    {
      provide: FindOneOrAllGroupsUsecase,
      useClass: FindOneOrAllGroupsUsecase,
    },
  ],
  exports: [GroupRepository],
})
export class GroupsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'v1/groups', method: RequestMethod.ALL });
  }
}
