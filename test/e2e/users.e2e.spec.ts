import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../../src/modules/users.module';
import * as request from 'supertest';
import { CreateUserRequest } from '../../src/presentation/http/dto/CreateUser';
import { VALID_EMAIL, VALID_USER } from '../helpers';

describe('users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
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
