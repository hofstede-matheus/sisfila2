import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../data/typeorm/entities/users';
import { AppController } from '../presentation/http/controllers/app.controller';

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
      entities: [User],
      logging: process.env.DATABASE_LOGGING === 'true',
      migrations: ['dist/data/typeorm/migrations/*.js'],
      migrationsRun: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
