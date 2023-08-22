import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../data/typeorm/entities/clients';
import { Group } from '../data/typeorm/entities/groups';
import { Organization } from '../data/typeorm/entities/organizations';
import { Queue } from '../data/typeorm/entities/queues';
import { Service } from '../data/typeorm/entities/services';
import { User } from '../data/typeorm/entities/users';
import { AppController } from '../presentation/http/controllers/app.controller';
import { ClientsModule } from './clients.module';
import { CommonModule } from './common.module';
import { GroupsModule } from './groups.module';
import { OrganizationsModule } from './organizations.module';
import { QueuesModule } from './queues.module';
import { ServicesModule } from './services.module';
import { UsersModule } from './users.module';

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
      migrations: ['dist/src/data/typeorm/migrations/*.js'],
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
