import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { VALID_ORGANIZATION } from '../helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { connectionSource } from '../../ormconfig-test';
import { CommonModule } from '../../src/modules/common.module';
import { OrganizationsModule } from '../../src/modules/organizations.module';
import { CreateOrganizationRequest } from '../../src/presentation/http/dto/CreateOrganization';
import { UsersModule } from '../../src/modules/users.module';
import { Organization } from '../../src/data/typeorm/entities/organizations';
import { UpdateOrganizationRequest } from '../../src/presentation/http/dto/UpdateOrganization';

describe('organizations', () => {
  let app: INestApplication;

  connectionSource.initialize();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        OrganizationsModule,
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
          entities: [Organization],
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
    await connectionSource.query(`DELETE FROM organizations`);
  });

  it('shoud be able to create organization', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(body.id).toBeDefined();
  });

  it('shoud be able to update organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .put('/organizations')
      .send({
        id: bodyOfCreateRequest.id,
        name: VALID_ORGANIZATION.name + '_new',
        code: VALID_ORGANIZATION.code + '_n',
      } as UpdateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/organizations/${bodyOfCreateRequest.id}`)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneRequest.name).toBe(VALID_ORGANIZATION.name + '_new');
    expect(bodyOfFindOneRequest.code).toBe(VALID_ORGANIZATION.code + '_n');
  });

  it('shoud be able to get one organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/organizations/${bodyOfCreateRequest.id}`)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneRequest.name).toBe(VALID_ORGANIZATION.name);
    expect(bodyOfFindOneRequest.code).toBe(VALID_ORGANIZATION.code);
  });

  it('shoud be able to remove organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/organizations/${bodyOfCreateRequest.id}`)
      .set('Accept', 'application/json')
      .expect(200);
  });

  it('shoud be able to get all organizations', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/organizations`)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneRequest.length).toBe(1);
    expect(bodyOfFindOneRequest[0].name).toBe(VALID_ORGANIZATION.name);
    expect(bodyOfFindOneRequest[0].code).toBe(VALID_ORGANIZATION.code);
  });
});
