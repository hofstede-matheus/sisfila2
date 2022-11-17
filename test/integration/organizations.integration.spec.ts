import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { generateUser, TEST_CONFIG, VALID_ORGANIZATION } from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import { CreateOrganizationRequest } from '../../src/presentation/http/dto/CreateOrganization';
import { UpdateOrganizationRequest } from '../../src/presentation/http/dto/UpdateOrganization';

describe('organizations', () => {
  let app: INestApplication;
  let USER: { token: string; email: string; id: string };

  connectionSource.initialize();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: TEST_CONFIG,
      providers: [],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    USER = await generateUser(app);
  });

  afterAll(async () => {
    await app.close();
    await connectionSource.destroy();
  });

  afterEach(async () => {
    await connectionSource.query(`DELETE FROM organizations`);

    await connectionSource.query(`DELETE FROM services`);
    await connectionSource.query(`DELETE FROM queues`);
    await connectionSource.query(`DELETE FROM groups`);
  });

  it('shoud be able to create organization with default service, queue and group', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(body.id).toBeDefined();

    const { body: bodyOfGetDefaultServiceRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/services/organizations/${body.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetDefaultServiceRequest[0].id).toBeDefined();

    const { body: bodyOfGetDefaultQueueRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/queues/organizations/${body.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetDefaultQueueRequest[0].id).toBeDefined();

    const { body: bodyOfGetDefaultGroupRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/groups/organizations/${body.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetDefaultGroupRequest[0].id).toBeDefined();
  });

  it('shoud be able to update organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/users/${USER.id}/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .put('/organizations')
      .set('Authorization', USER.token)
      .send({
        id: bodyOfCreateRequest.id,
        name: VALID_ORGANIZATION.name + '_new',
        code: VALID_ORGANIZATION.code + '_n',
      } as UpdateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
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
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/users/${USER.id}/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
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
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);
  });

  it('shoud be able to get all organizations', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/users/${USER.id}/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/organizations`)
      .set('Authorization', USER.token)
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
