import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../data/typeorm/entities/groups';
import { TypeOrmGroupsRepository } from '../data/typeorm/repositories/TypeOrmGroupsRepository';
import { GroupRepository } from '../domain/repositories/GroupRepository';
import { FindOneOrAllGroupsUsecase } from '../interactors/usecases/FindOneOrAllGroupsUsecase';
import { GroupController } from '../presentation/http/controllers/GroupController';
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
export class GroupsModule {}
