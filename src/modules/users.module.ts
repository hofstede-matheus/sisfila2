import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../data/typeorm/entities/users';
import { TypeOrmUsersRepository } from '../data/typeorm/repositories/TypeOrmUsersRepository';
import { UserRepository } from '../domain/repositories/UserRepository';
import { AuthenticateUserUsecase } from '../interactors/usecases/AuthenticateUserUsecase';
import { AuthenticateWithGoogleUsecase } from '../interactors/usecases/AuthenticateWithGoogleUsecase';
import { CreateUserUsecase } from '../interactors/usecases/CreateUserUsecase';
import { UserController } from '../presentation/http/controllers/UserController';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    { provide: CreateUserUsecase, useClass: CreateUserUsecase },
    { provide: AuthenticateUserUsecase, useClass: AuthenticateUserUsecase },
    {
      provide: AuthenticateWithGoogleUsecase,
      useClass: AuthenticateWithGoogleUsecase,
    },
    {
      provide: UserRepository,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UserRepository],
})
export class UsersModule {}
