import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './data/typeorm/entities/organizations.typeorm-entity';
import { TypeOrmOrganizationsRepository } from './data/typeorm/repositories/TypeOrmOrganizationsRepository';
import { OrganizationRepository } from './domain/repositories/OrganizationRepository';
import { CreateOrganizationUsecase } from './interactors/usecases/CreateOrganizationUsecase';
import { FindOneOrAllOrganizationsUsecase } from './interactors/usecases/FindOneOrAllOrganizationsUsecase';
import { RemoveOrganizationUsecase } from './interactors/usecases/RemoveOrganizationUsecase';
import { UpdateOrganizationUsecase } from './interactors/usecases/UpdateOrganizationUsecase';
import { OrganizationController } from './presentation/http/controllers/OrganizationController';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from '../common/common.module';
import { GroupsModule } from '../groups/groups.module';
import { QueuesModule } from '../queues/queues.module';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Organization]),
    forwardRef(() => UsersModule),
    forwardRef(() => ServicesModule),
    forwardRef(() => QueuesModule),
    forwardRef(() => GroupsModule),
  ],
  controllers: [OrganizationController],
  providers: [
    { provide: CreateOrganizationUsecase, useClass: CreateOrganizationUsecase },
    { provide: UpdateOrganizationUsecase, useClass: UpdateOrganizationUsecase },
    {
      provide: FindOneOrAllOrganizationsUsecase,
      useClass: FindOneOrAllOrganizationsUsecase,
    },
    {
      provide: RemoveOrganizationUsecase,
      useClass: RemoveOrganizationUsecase,
    },
    {
      provide: OrganizationRepository,
      useClass: TypeOrmOrganizationsRepository,
    },
  ],
  exports: [OrganizationRepository],
})
export class OrganizationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      // .exclude({
      //   path: 'v1/organizations/:id',
      //   method: RequestMethod.GET,
      // })
      .forRoutes({ path: 'v1/organizations*', method: RequestMethod.ALL });
  }
}
