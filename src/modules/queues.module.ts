import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from '../data/typeorm/entities/queues';
import { TypeOrmQueuesRepository } from '../data/typeorm/repositories/TypeOrmQueuesRepository';
import { QueueRepository } from '../domain/repositories/QueueRepository';
import { FindOneOrAllQueuesUsecase } from '../interactors/usecases/FindOneOrAllQueuesUsecase';
import { QueueController } from '../presentation/http/controllers/QueueController';
import { CommonModule } from './common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Queue])],
  controllers: [QueueController],
  providers: [
    {
      provide: QueueRepository,
      useClass: TypeOrmQueuesRepository,
    },
    {
      provide: FindOneOrAllQueuesUsecase,
      useClass: FindOneOrAllQueuesUsecase,
    },
  ],
  exports: [QueueRepository],
})
export class QueuesModule {}
