import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../data/typeorm/entities/users';
import { TypeOrmUsersRepository } from '../data/typeorm/repositories/TypeOrmUsersRepository';
import { UserRepository } from '../domain/repositories/UserRepository';
import { AuthenticateUserUsecase } from '../interactors/usecases/AuthenticateUserUsecase';
import { CreateCoordinatorUsecase } from '../interactors/usecases/CreateCoordinatorUsecase';
import { UserController } from '../presentation/http/controllers/UserController';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    { provide: CreateCoordinatorUsecase, useClass: CreateCoordinatorUsecase },
    { provide: AuthenticateUserUsecase, useClass: AuthenticateUserUsecase },
    {
      provide: UserRepository,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UserRepository],
})
export class UsersModule {}
