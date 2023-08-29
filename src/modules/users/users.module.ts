import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../organizations/data/typeorm/entities/organizations.typeorm-entity';
import { User } from './data/typeorm/entities/users.typeorm-entity';
import { TypeOrmUsersRepository } from './data/typeorm/repositories/TypeOrmUsersRepository';
import { UserRepository } from './domain/repositories/UserRepository';
import { AuthenticateUserUsecase } from '../../interactors/usecases/AuthenticateUserUsecase';
import { AuthenticateWithGoogleUsecase } from '../../interactors/usecases/AuthenticateWithGoogleUsecase';
import { CreateUserUsecase } from '../../interactors/usecases/CreateUserUsecase';
import { FindOneOrAllUsersUsecase } from '../../interactors/usecases/FindOneOrAllUsersUsecase';
import { SetUserRoleInOrganizationUsecase } from '../../interactors/usecases/SetUserRoleInOrganizationUsecase';
import { UserController } from '../../presentation/http/controllers/v1/UserController';
import { AuthenticationMiddleware } from '../../presentation/http/middleware/AuthenticationMiddleware';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([User, Organization])],
  controllers: [UserController],
  providers: [
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
    { provide: FindOneOrAllUsersUsecase, useClass: FindOneOrAllUsersUsecase },
    {
      provide: UserRepository,
      useClass: TypeOrmUsersRepository,
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
