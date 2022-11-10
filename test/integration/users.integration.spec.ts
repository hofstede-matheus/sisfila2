import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateUserRequest } from '../../src/presentation/http/dto/CreateUser';
import {
  generateValidEmail,
  JWT_TOKEN_REGEX_EXPRESSION,
  VALID_ORGANIZATION,
  VALID_USER,
} from '../helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/data/typeorm/entities/users';
import { ConfigModule } from '@nestjs/config';
import { connectionSource } from '../../ormconfig-test';
import { UsersModule } from '../../src/modules/users.module';
import { CommonModule } from '../../src/modules/common.module';
import { CreateOrganizationRequest } from '../../src/presentation/http/dto/CreateOrganization';
import { OrganizationsModule } from '../../src/modules/organizations.module';
import { Organization } from '../../src/data/typeorm/entities/organizations';

describe('users', () => {
  let app: INestApplication;

  connectionSource.initialize();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        OrganizationsModule,
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
          entities: [User, Organization],
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
    await connectionSource.destroy();
  });

  afterEach(async () => {
    await connectionSource.query(`DELETE FROM users`);
    await connectionSource.query(`DELETE FROM organizations`);
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

  it('shoud be able to set user role in organization', async () => {
    const validEmail = generateValidEmail();
    const { body: bodyOfCreateUserRequest } = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: VALID_USER.name,
        email: validEmail,
        password: VALID_USER.password,
      } as CreateUserRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateOrganizationRequest } = await request(
      app.getHttpServer(),
    )
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/users/${bodyOfCreateUserRequest.user.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfGetUserRequest } = await request(app.getHttpServer())
      .get(`/users/${bodyOfCreateUserRequest.user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetUserRequest.id).toBeDefined();
    expect(bodyOfGetUserRequest.userRolesOnOrganizationsMap.length).toBe(1);
    expect(
      bodyOfGetUserRequest.userRolesOnOrganizationsMap[0].organizationId,
    ).toBe(bodyOfCreateOrganizationRequest.id);
    expect(bodyOfGetUserRequest.userRolesOnOrganizationsMap[0].role).toBe(
      'TYPE_COORDINATOR',
    );
  }, 99999);

  it('shoud be able to update user role in organization', async () => {
    const validEmail = generateValidEmail();
    const { body: bodyOfCreateUserRequest } = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: VALID_USER.name,
        email: validEmail,
        password: VALID_USER.password,
      } as CreateUserRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateOrganizationRequest } = await request(
      app.getHttpServer(),
    )
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/users/${bodyOfCreateUserRequest.user.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfGetUserRequest } = await request(app.getHttpServer())
      .get(`/users/${bodyOfCreateUserRequest.user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetUserRequest.id).toBeDefined();
    expect(bodyOfGetUserRequest.userRolesOnOrganizationsMap.length).toBe(1);
    expect(
      bodyOfGetUserRequest.userRolesOnOrganizationsMap[0].organizationId,
    ).toBe(bodyOfCreateOrganizationRequest.id);
    expect(bodyOfGetUserRequest.userRolesOnOrganizationsMap[0].role).toBe(
      'TYPE_COORDINATOR',
    );

    await request(app.getHttpServer())
      .patch(
        `/users/${bodyOfCreateUserRequest.user.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .send({
        role: 'TYPE_ATTENDENT',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfSecondGetUserRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/users/${bodyOfCreateUserRequest.user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfSecondGetUserRequest.id).toBeDefined();
    expect(bodyOfSecondGetUserRequest.userRolesOnOrganizationsMap.length).toBe(
      1,
    );
    expect(
      bodyOfSecondGetUserRequest.userRolesOnOrganizationsMap[0].organizationId,
    ).toBe(bodyOfCreateOrganizationRequest.id);
    expect(bodyOfSecondGetUserRequest.userRolesOnOrganizationsMap[0].role).toBe(
      'TYPE_ATTENDENT',
    );
  }, 99999);

  it('shoud be able to unset user role in organization', async () => {
    const validEmail = generateValidEmail();
    const { body: bodyOfCreateUserRequest } = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: VALID_USER.name,
        email: validEmail,
        password: VALID_USER.password,
      } as CreateUserRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateOrganizationRequest } = await request(
      app.getHttpServer(),
    )
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/users/${bodyOfCreateUserRequest.user.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfGetUserRequest } = await request(app.getHttpServer())
      .get(`/users/${bodyOfCreateUserRequest.user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetUserRequest.id).toBeDefined();
    expect(bodyOfGetUserRequest.userRolesOnOrganizationsMap.length).toBe(1);
    expect(
      bodyOfGetUserRequest.userRolesOnOrganizationsMap[0].organizationId,
    ).toBe(bodyOfCreateOrganizationRequest.id);
    expect(bodyOfGetUserRequest.userRolesOnOrganizationsMap[0].role).toBe(
      'TYPE_COORDINATOR',
    );

    await request(app.getHttpServer())
      .patch(
        `/users/${bodyOfCreateUserRequest.user.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .send({
        role: undefined,
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfSecondGetUserRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/users/${bodyOfCreateUserRequest.user.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfSecondGetUserRequest.id).toBeDefined();
    expect(bodyOfSecondGetUserRequest.userRolesOnOrganizationsMap.length).toBe(
      0,
    );
  }, 99999);

  // it('shoud be able to authenticate a user with google when creating a new account', async () => {
  //   const { body } = await request(app.getHttpServer())
  //     .post('/users/auth/google')
  //     .send({
  //       idToken:
  //         'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc3Y2MwZWY0YzcxODFjZjRjMGRjZWY3YjYwYWUyOGNjOTAyMmM3NmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMDk3Mjc3MzkxMTIxLTVmMGQyZzl1ajQ4aDlobm44bHB2dHAxbG81ZHEyY3JnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTA5NzI3NzM5MTEyMS01ZjBkMmc5dWo0OGg5aG5uOGxwdnRwMWxvNWRxMmNyZy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMzYxMjM1OTIxNDU2NzIyODI5MiIsImVtYWlsIjoicGFibG9oZW5yaXF1ZS5yLmNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5vbmNlIjoiNDAzMmVlZDE5MDAyNGZlZjFlOTRjZWUyMTZjNTgyN2Y4NjZlYzI5MDI0MjQ5ZDZhMTdhMzA3ZTczMTI1Nzc2MyIsIm5hbWUiOiJQYWJsbyBIZW5yaXF1ZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BTG01d3UwQlN0RUxGbEJrbDZ5czhERHVNYjJhVng2eXVlNEFnSHlIZHY5UFd3PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlBhYmxvIiwiZmFtaWx5X25hbWUiOiJIZW5yaXF1ZSIsImxvY2FsZSI6InB0LUJSIiwiaWF0IjoxNjY2ODA1NTU2LCJleHAiOjE2NjY4MDkxNTYsImp0aSI6IjNkNjMzZmJlOGJmMGY0Y2NjNjE4OTNjYjJiMDdjY2Q2OGYyZDg3ZjEifQ.R4Mru5pj4PhZKE7mJLnf_zGD9YLPpq1MPC1da7BTWduJJG1V_E3Z_cPyFdPS6u3uzZnsdBkKKirXX2_lIEkcbrqOv07z5ydqX3_llA2ICJt2FGzNshvpi39tOJwsfArswGFE9mRn9nW5ME8AE4dHBUpNgPq6KVVK1d561AVxxX7ElNmhMHuYjhhCoY1TlAiz_f7TiFEYMValyvL0J3GDLnO9psglyZrAkXNtGPRjw-mDFA26SrFa7iN5wtz1lc_v8DHCqRyiZsXUJ4lq2rr91i51m-jOIwnx18kVkn-gVDkwWpb-_zataTkY3ZLN1Mq64UybNonHfYb6HM7IyC1AzQ',
  //       audience:
  //         '1097277391121-5f0d2g9uj48h9hnn8lpvtp1lo5dq2crg.apps.googleusercontent.com',
  //     })
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(body.token).toBeDefined();
  //   expect(body.token).toMatch(JWT_TOKEN_REGEX_EXPRESSION);
  // });
});
