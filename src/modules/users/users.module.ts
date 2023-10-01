import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../organizations/data/typeorm/entities/organizations.typeorm-entity';
import { User } from './data/typeorm/entities/users.typeorm-entity';
import { TypeOrmUsersRepository } from './data/typeorm/repositories/TypeOrmUsersRepository';
import { UserRepository } from './domain/repositories/UserRepository';
import { AuthenticateUserUsecase } from './interactors/usecases/AuthenticateUserUsecase';
import { AuthenticateWithGoogleUsecase } from './interactors/usecases/AuthenticateWithGoogleUsecase';
import { CreateUserUsecase } from './interactors/usecases/CreateUserUsecase';
import { FindOneUserUsecase } from './interactors/usecases/FindOneUserUsecase';
import { SetUserRoleInOrganizationUsecase } from './interactors/usecases/SetUserRoleInOrganizationUsecase';
import { UserController } from './presentation/http/controllers/UserController';
import { AuthenticationMiddleware } from '../common/presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from '../common/common.module';
import { FindAllFromOrganizationUsecase } from './interactors/usecases/FindAllFromOrganizationUsecase';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RemoveUserFromOrganizationUsecase } from './interactors/usecases/RemoveUserFromOrganizationUsecase';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => OrganizationsModule),
    TypeOrmModule.forFeature([User, Organization]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: TypeOrmUsersRepository,
    },
    { provide: CreateUserUsecase, useClass: CreateUserUsecase },
    { provide: AuthenticateUserUsecase, useClass: AuthenticateUserUsecase },
    {
      provide: AuthenticateWithGoogleUsecase,
      useClass: AuthenticateWithGoogleUsecase,
    },
    {
      provide: SetUserRoleInOrganizationUsecase,
      useClass: SetUserRoleInOrganizationUsecase,
    },
    { provide: FindOneUserUsecase, useClass: FindOneUserUsecase },
    {
      provide: FindAllFromOrganizationUsecase,
      useClass: FindAllFromOrganizationUsecase,
    },
    {
      provide: RemoveUserFromOrganizationUsecase,
      useClass: RemoveUserFromOrganizationUsecase,
    },
  ],
  exports: [UserRepository],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        {
          path: 'v1/users',
          method: RequestMethod.POST,
        },
        {
          path: 'v1/users/auth',
          method: RequestMethod.POST,
        },
        {
          path: 'v1/users/auth/google',
          method: RequestMethod.POST,
        },
      )
      .forRoutes({ path: 'v1/users*', method: RequestMethod.ALL });
  }
}
