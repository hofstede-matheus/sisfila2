import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateUserRequest } from '../../src/presentation/http/dto/CreateUser';
import {
  generateValidEmail,
  JWT_TOKEN_REGEX_EXPRESSION,
  UUID_V4_REGEX_EXPRESSION,
  VALID_USER,
} from '../helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/data/typeorm/entities/users';
import { ConfigModule } from '@nestjs/config';
import { connectionSource } from '../../ormconfig-test';
import { UsersModule } from '../../src/modules/users.module';
import { CommonModule } from '../../src/modules/common.module';

describe('users', () => {
  let app: INestApplication;

  connectionSource.initialize();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        CommonModule,
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          migrations: ['src/data/typeorm/migrations/*.ts'],
          migrationsRun: true,
          entities: [User],
          logging: process.env.DATABASE_LOGGING === 'true',
        }),
      ],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await connectionSource.query(`DELETE FROM users`);
  });

  it('shoud be able to create user', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'valid name',
        email: generateValidEmail(),
        password: '12345678',
      } as CreateUserRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(body.token).toBeDefined();
    expect(body.token).toMatch(UUID_V4_REGEX_EXPRESSION);
  });

  it('shoud be able to authenticate a user', async () => {
    const validEmail = generateValidEmail();
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: VALID_USER.name,
        email: validEmail,
        password: VALID_USER.password,
      } as CreateUserRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .post('/users/auth')
      .send({
        email: validEmail,
        password: VALID_USER.password,
      })
      .set('Accept', 'application/json')
      .expect(200);

    expect(body.token).toBeDefined();
    expect(body.token).toMatch(JWT_TOKEN_REGEX_EXPRESSION);
  });

  it('shoud be able to authenticate a user with google when creating a new account', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/users/auth/google')
      .send({
        oauthToken:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6ImVlMWI5Zjg4Y2ZlMzE1MWRkZDI4NGE2MWJmOGNlY2Y2NTliMTMwY2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTgxMTY0NjU1NDczODU1OTE4MjIiLCJhdF9oYXNoIjoiRXE1cGtIbTh2RUdKX1lyMl8wbFZQUSIsIm5hbWUiOiJNYXRoZXVzIEhvZnN0ZWRlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FMbTV3dTBZbmxlOE5Zb25DbnRHay1zZG4yRE52QWlJbU9WZzZiUWt5LU5xUHc9czk2LWMiLCJnaXZlbl9uYW1lIjoiTWF0aGV1cyIsImZhbWlseV9uYW1lIjoiSG9mc3RlZGUiLCJsb2NhbGUiOiJwdC1CUiIsImlhdCI6MTY2NjYzNjQ0MSwiZXhwIjoxNjY2NjQwMDQxfQ.dblpmKJitc-MdStdYitK_sbSddJnUtZ4AdnCldkpt5fqR6CUICkxaytN2naIKfnyfdGrgauGFQQMHxpn4zWbPYMex47q0w7eDW0ELwb_Mi60sml7bjs3PQSimPyWd0h8m8TW8LhtNzTEATWvZ2J9E3NqKwKFIGLjYIj3jzA2YNPx3BD9Eju4Y1ABrYpoft8wgF300Frdgu_SKZqxxQyu8gu9bwmVn5bHy301Zlphcn3QEAIVG0N4bBXXJtE39ZnhgrSpThjA0lL8LgrWQNpNvaSerfXi3Z-NcaaoUc1c2x8yAemO4l9jgrCATZeqz385Ph77WTxzJYNDyKsjHRHPJg',
        audience:
          '1097277391121-5f0d2g9uj48h9hnn8lpvtp1lo5dq2crg.apps.googleusercontent.com',
      })
      .set('Accept', 'application/json')
      .expect(200);

    expect(body.token).toBeDefined();
    expect(body.token).toMatch(JWT_TOKEN_REGEX_EXPRESSION);
  });
});
