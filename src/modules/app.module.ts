import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './clients/data/typeorm/entities/clients.typeorm-entity';
import { Group } from './groups/data/typeorm/entities/groups.typeorm-entity';
import { Organization } from './organizations/data/typeorm/entities/organizations.typeorm-entity';
import { Queue } from './queues/data/typeorm/entities/queues.typeorm-entity';
import { Service } from './services/data/typeorm/entities/services.typeorm-entity';
import { User } from './users/data/typeorm/entities/users.typeorm-entity';
import { AppController } from '../presentation/http/controllers/app.controller';
import { ClientsModule } from './clients/clients.module';
import { CommonModule } from './common/common.module';
import { GroupsModule } from './groups/groups.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { QueuesModule } from './queues/queues.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Organization, Service, Queue, Group, Client],
      logging: process.env.DATABASE_LOGGING === 'true',
      migrations: ['dist/src/modules/common/data/typeorm/migrations/*.js'],
      migrationsRun: true,
      ssl: process.env.DATABASE_SSL === 'true',
    }),
    UsersModule,
    OrganizationsModule,
    ServicesModule,
    QueuesModule,
    GroupsModule,
    CommonModule,
    ClientsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
