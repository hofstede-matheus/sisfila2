import { Module } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/UserRepository';
import { CreateCoordinatorUsecase } from '../interactors/usecases/CreateCoordinatorUsecase';
import { UserController } from '../presentation/http/controllers/UserController';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    { provide: CreateCoordinatorUsecase, useClass: CreateCoordinatorUsecase },
    {
      provide: UserRepository,
      useValue: { create: () => Promise.resolve('valid_token') },
    },
  ],
  exports: [],
})
export class UsersModule {}
