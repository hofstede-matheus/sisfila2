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
    await connectionSource.query(`DELETE FROM users`);
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
  }, 999999999);
});
