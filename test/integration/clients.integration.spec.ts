import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  generateTestingApp,
  generateUser,
  VALID_CLIENT,
  VALID_ORGANIZATION,
} from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import { CreateOrganizationRequest } from '../../src/presentation/http/dto/CreateOrganization';
import { CreateClientRequest } from '../../src/presentation/http/dto/CreateClient';

describe('clients', () => {
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
    // await connectionSource.query(`DELETE FROM users`);
    await connectionSource.query(`DELETE FROM organizations`);
    await connectionSource.query(`DELETE FROM clients`);
  });

  it('shoud be able to create client', async () => {
    const { body: bodyOfCreateOrganizationRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateOrganizationRequest.id).toBeDefined();

    const { body: bodyOfCreateClientRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
        registrationId: '12345678',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateClientRequest.id).toBeDefined();
  });

  it('shoud be able to get one client as user', async () => {
    const USER2 = await generateUser(app);
    const { body: bodyOfCreateOrganization1Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateOrganization2Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/organizations')
      .set('Authorization', USER2.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code + '_2',
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateOrganization1Request.id).toBeDefined();
    expect(bodyOfCreateOrganization2Request.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${bodyOfCreateOrganization1Request.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER2.id}/organizations/${bodyOfCreateOrganization2Request.id}`,
      )
      .set('Authorization', USER2.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfCreateClient1Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganization1Request.id,
        registrationId: '12345678',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateClient2Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER2.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganization2Request.id,
        registrationId: '123456789',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateClient1Request.id).toBeDefined();
    expect(bodyOfCreateClient2Request.id).toBeDefined();

    const { body: bodyOfFindOneClient1Request } = await request(
      app.getHttpServer(),
    )
      .get(
        `/v1/clients/${bodyOfCreateClient1Request.id}/organizations/${bodyOfCreateOrganization1Request.id}`,
      )
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .get(
        `/v1/clients/${bodyOfCreateClient2Request.id}/organizations/${bodyOfCreateOrganization2Request.id}`,
      )
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(404);

    expect(bodyOfFindOneClient1Request.name).toBe(VALID_CLIENT.name);
  }, 999999);

  it('shoud be able to get one client as admin', async () => {
    await connectionSource.query(`UPDATE users SET is_super_admin = true`);
    const USER2 = await generateUser(app);
    const { body: bodyOfCreateOrganization1Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code,
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateOrganization2Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/organizations')
      .set('Authorization', USER2.token)
      .send({
        name: VALID_ORGANIZATION.name,
        code: VALID_ORGANIZATION.code + '_2',
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateOrganization1Request.id).toBeDefined();
    expect(bodyOfCreateOrganization2Request.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${bodyOfCreateOrganization1Request.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER2.id}/organizations/${bodyOfCreateOrganization2Request.id}`,
      )
      .set('Authorization', USER2.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfCreateClient1Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganization1Request.id,
        registrationId: '12345678',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfCreateClient2Request } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER2.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganization2Request.id,
        registrationId: '123456789',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateClient1Request.id).toBeDefined();
    expect(bodyOfCreateClient2Request.id).toBeDefined();

    const { body: bodyOfFindOneClient1Request } = await request(
      app.getHttpServer(),
    )
      .get(
        `/v1/clients/${bodyOfCreateClient1Request.id}/organizations/${bodyOfCreateOrganization1Request.id}`,
      )
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfFindOneClient2Request } = await request(
      app.getHttpServer(),
    )
      .get(
        `/v1/clients/${bodyOfCreateClient2Request.id}/organizations/${bodyOfCreateOrganization2Request.id}`,
      )
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneClient1Request.name).toBe(VALID_CLIENT.name);
    expect(bodyOfFindOneClient2Request.name).toBe(VALID_CLIENT.name);
  }, 999999);
});
