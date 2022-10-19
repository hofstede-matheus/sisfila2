import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../../src/modules/users.module';
import * as request from 'supertest';
import { CreateUserRequest } from '../../src/presentation/http/dto/CreateUser';
import { VALID_EMAIL, VALID_USER } from '../helpers';
import { AuthenticateUserUsecase } from '../../src/interactors/usecases/AuthenticateUserUsecase';
import { right } from '../../src/shared/helpers/either';

describe('users', () => {
  let app: INestApplication;
  let authenticateUserUsecase: AuthenticateUserUsecase;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
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

  it('shoud be able to create user', async () => {
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

    expect(body).toStrictEqual({ token: 'valid_token' });
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

    expect(body).toStrictEqual({ token: 'valid_token' });
  });
});
