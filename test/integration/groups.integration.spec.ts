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
import { CreateGroupRequest } from '../../src/presentation/http/dto/CreateGroup';
import { CreateClientRequest } from '../../src/presentation/http/dto/CreateClient';
import { ImportClientsRequest } from '../../src/presentation/http/dto/ImportClients';

describe('groups', () => {
  let app: INestApplication;
  let USER: { token: string; email: string; id: string };
  let USER2: { token: string; email: string; id: string };

  connectionSource.initialize();

  beforeAll(async () => {
    app = await generateTestingApp();
    await app.init();
    USER = await generateUser(app);
    USER2 = await generateUser(app);
    await connectionSource.query(
      `UPDATE users SET is_super_admin = true where id = $1`,
      [USER2.id],
    );
  });

  afterAll(async () => {
    await app.close();
    await connectionSource.destroy();
  });

  afterEach(async () => {
    await connectionSource.query(`DELETE FROM organizations`);
    await connectionSource.query(`DELETE FROM clients`);
    await connectionSource.query(`DELETE FROM groups`);
  });

  it('should be able to create group', async () => {
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

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfCreateGroupRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/groups')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as CreateGroupRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();
  });

  it('should be able to get group', async () => {
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

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfCreateGroupRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/groups')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as CreateGroupRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();

    const { body: bodyOfGetGroupRequest } = await request(app.getHttpServer())
      .get(`/v1/groups/organizations/${bodyOfCreateOrganizationRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetGroupRequest[0].id).toBeDefined();
  });

  it('should be able to import clients to group', async () => {
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

    await connectionSource.query(`DELETE FROM groups`);

    expect(bodyOfCreateOrganizationRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfCreateGroupRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/groups')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as CreateGroupRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();

    const { body: bodyOfCreateClientRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
        registrationId: '123456789',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateClientRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: bodyOfCreateGroupRequest.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '123456789',
            organizationId: bodyOfCreateOrganizationRequest.id,
          },
        ],
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfGetGroupRequest } = await request(app.getHttpServer())
      .get(`/v1/groups/organizations/${bodyOfCreateOrganizationRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetGroupRequest[0].id).toBe(bodyOfCreateGroupRequest.id);

    expect(bodyOfGetGroupRequest[0].clients[0].id).toBe(
      bodyOfCreateClientRequest.id,
    );
  });

  it('previous clients from group should be deleted when adding new ones', async () => {
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

    await connectionSource.query(`DELETE FROM groups`);

    expect(bodyOfCreateOrganizationRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfCreateGroupRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/groups')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as CreateGroupRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();

    const { body: bodyOfCreateClientRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
        registrationId: '123456789',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateClientRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: bodyOfCreateGroupRequest.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '123456789',
            organizationId: bodyOfCreateOrganizationRequest.id,
          },
        ],
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfGetGroupRequest } = await request(app.getHttpServer())
      .get(`/v1/groups/organizations/${bodyOfCreateOrganizationRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetGroupRequest[0].id).toBe(bodyOfCreateGroupRequest.id);

    expect(bodyOfGetGroupRequest[0].clients[0].id).toBe(
      bodyOfCreateClientRequest.id,
    );

    const { body: bodyOfCreateClientRequest2 } = await request(
      app.getHttpServer(),
    )
      .post('/v1/clients')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        organizationId: bodyOfCreateOrganizationRequest.id,
        registrationId: '1234567890',
      } as CreateClientRequest)
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateClientRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: bodyOfCreateGroupRequest.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '1234567890',
            organizationId: bodyOfCreateOrganizationRequest.id,
          },
        ],
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    const { body: bodyOfGetGroupRequest2 } = await request(app.getHttpServer())
      .get(`/v1/groups/organizations/${bodyOfCreateOrganizationRequest.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetGroupRequest2[0].id).toBe(bodyOfCreateGroupRequest.id);
    expect(bodyOfGetGroupRequest2[0].clients.length).toBe(1);
    expect(bodyOfGetGroupRequest2[0].clients[0].id).toBe(
      bodyOfCreateClientRequest2.id,
    );
  });
});
