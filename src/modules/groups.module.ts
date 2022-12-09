import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../data/typeorm/entities/groups';
import { TypeOrmGroupsRepository } from '../data/typeorm/repositories/TypeOrmGroupsRepository';
import { GroupRepository } from '../domain/repositories/GroupRepository';
import { CreateGroupUsecase } from '../interactors/usecases/CreateGroupUsecase';
import { FindOneOrAllGroupsUsecase } from '../interactors/usecases/FindOneOrAllGroupsUsecase';
import { ImportClientsToGroupUsecase } from '../interactors/usecases/ImportClientsToGroupUsecase';
import { GroupController } from '../presentation/http/controllers/v1/GroupController';
import { AuthenticationMiddleware } from '../presentation/http/middleware/AuthenticationMiddleware';
import { ClientsModule } from './clients.module';
import { CommonModule } from './common.module';
import { OrganizationsModule } from './organizations.module';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => OrganizationsModule),
    forwardRef(() => ClientsModule),
    TypeOrmModule.forFeature([Group]),
  ],
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
    {
      provide: CreateGroupUsecase,
      useClass: CreateGroupUsecase,
    },
    {
      provide: ImportClientsToGroupUsecase,
      useClass: ImportClientsToGroupUsecase,
    },
  ],
  exports: [GroupRepository],
})
export class GroupsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'v1/groups*', method: RequestMethod.ALL });
  }
}
