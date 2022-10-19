import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../../src/modules/users.module';
import * as request from 'supertest';
import { CreateUserRequest } from '../../src/presentation/http/dto/CreateUser';
import { UUID_V4_REGEX_EXPRESSION, VALID_EMAIL, VALID_USER } from '../helpers';
import { AuthenticateUserUsecase } from '../../src/interactors/usecases/AuthenticateUserUsecase';
import { right } from '../../src/shared/helpers/either';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/data/typeorm/entities/users';
import { ConfigModule } from '@nestjs/config';
import { connectionSource } from '../../ormconfig';

describe('users', () => {
  let app: INestApplication;
  let authenticateUserUsecase: AuthenticateUserUsecase;

  connectionSource.initialize();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
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
      providers: [
        {
          provide: AuthenticateUserUsecase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    authenticateUserUsecase = module.get<AuthenticateUserUsecase>(
      AuthenticateUserUsecase,
    );

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
    jest
      .spyOn(authenticateUserUsecase, 'execute')
      .mockImplementation(async () => {
        return right('valid_token');
      });

    const { body } = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'valid name',
        email: VALID_EMAIL,
        password: '12345678',
        userType: 'TYPE_COORDINATOR',
      } as CreateUserRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(body.token).toBeDefined();
    expect(body.token).toMatch(UUID_V4_REGEX_EXPRESSION);
  });

  it('shoud be able to authenticate a user', async () => {
    jest
      .spyOn(authenticateUserUsecase, 'execute')
      .mockImplementation(async () => {
        return right('valid_token');
      });
    const { body } = await request(app.getHttpServer())
      .post('/users/auth')
      .send({
        email: VALID_USER.email,
        password: VALID_USER.password,
      })
      .set('Accept', 'application/json')
      .expect(200);

    expect(body).toMatchObject({ token: 'valid_token' });
  });
});
