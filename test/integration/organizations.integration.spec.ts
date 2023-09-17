import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  generateTestingApp,
  generateUser,
  VALID_ORGANIZATION,
} from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import { CreateOrganizationRequest } from '../../src/modules/organizations/presentation/http/dto/CreateOrganization';
import { UpdateOrganizationRequest } from '../../src/modules/organizations/presentation/http/dto/UpdateOrganization';

describe('organizations', () => {
  let app: INestApplication;
  let USER: { token: string; email: string; id: string };

  connectionSource.initialize();

  beforeAll(async () => {
    app = await generateTestingApp();
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

  it('should be able to create organization with default service, queue and group', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/v1/organizations')
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
      .get(`/v1/services/organizations/${body.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetDefaultServiceRequest[0].id).toBeDefined();

    const { body: bodyOfGetDefaultQueueRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/v1/queues/organizations/${body.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetDefaultQueueRequest[0].id).toBeDefined();

    const { body: bodyOfGetDefaultGroupRequest } = await request(
      app.getHttpServer(),
    )
      .get(`/v1/groups/organizations/${body.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetDefaultGroupRequest[0].id).toBeDefined();
  });

  it('should be able to update organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/v1/users/${USER.id}/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        id: bodyOfCreateRequest.id,
        name: VALID_ORGANIZATION.name + '_new',
        code: VALID_ORGANIZATION.code + '_n',
      } as UpdateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/v1/organizations/${bodyOfCreateRequest.id}`)
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

  it('should be able to remove organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/v1/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);
  });

  it('should be able to get one organization', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/v1/users/${USER.id}/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/v1/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneRequest.name).toBe(VALID_ORGANIZATION.name);
    expect(bodyOfFindOneRequest.code).toBe(VALID_ORGANIZATION.code);
  });

  it('should be able to get all organizations', async () => {
    const { body: bodyOfCreateRequest } = await request(app.getHttpServer())
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(`/v1/users/${USER.id}/organizations/${bodyOfCreateRequest.id}`)
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneRequest } = await request(app.getHttpServer())
      .get(`/v1/organizations`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneRequest.length).toBe(1);
    expect(bodyOfFindOneRequest[0].name).toBe(VALID_ORGANIZATION.name);
    expect(bodyOfFindOneRequest[0].code).toBe(VALID_ORGANIZATION.code);
  });
});
