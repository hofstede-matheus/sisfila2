import { Module } from '@nestjs/common';
import { UserEntity } from '../domain/entities/User.entity';
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
      useValue: {
        create: () => Promise.resolve('valid_token'),
        findByEmail: () =>
          Promise.resolve({
            name: 'valid name',
            id: 'valid_id',
            email: 'valid_email',
            password: 'valid_password',
            userType: 'TYPE_COORDINATOR',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as UserEntity),
      } as UserRepository,
    },
  ],
  exports: [],
})
export class UsersModule {}
