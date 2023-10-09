import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { generateTestingApp, generateUser } from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import {
  _init,
  createClient,
  createOrganization,
  setUserRoleInOrganization,
  updateClient,
} from './helpers';
import moment from 'moment';
import { UserEntityTypes } from '../../src/modules/users/domain/entities/User.entity';

describe('clients', () => {
  let app: INestApplication;
  let USER: { token: string; email: string; id: string };
  let USER2: { token: string; email: string; id: string };

  const opensAt = moment().toDate();
  const closesAt = moment().add(1, 'day').add(1, 'hour').toDate();

  connectionSource.initialize();

  beforeAll(async () => {
    app = await generateTestingApp();
    await app.init();
    USER = await generateUser(app);
    USER2 = await generateUser(app);
    _init(app, USER, opensAt, closesAt);
  });

  afterAll(async () => {
    await app.close();
    await connectionSource.destroy();
  });

  afterEach(async () => {
    await connectionSource.query(`DELETE FROM organizations`);
    await connectionSource.query(`DELETE FROM clients`);
  });

  it('should be able to create client', async () => {
    const organization = await createOrganization();

    expect(organization.id).toBeDefined();

    const client = await createClient();

    expect(client.id).toBeDefined();
  });

  it('should be able to get one client as user', async () => {
    const organization = await createOrganization();
    const organization2 = await createOrganization({
      code: 'BSI_2',
      name: 'BSI_2',
    });

    expect(organization.id).toBeDefined();
    expect(organization2.id).toBeDefined();

    await setUserRoleInOrganization({
      userId: USER.id,
      organizationId: organization.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });
    await setUserRoleInOrganization({
      userId: USER2.id,
      organizationId: organization2.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });

    const client = await createClient({
      organizationId: organization.id,
      name: 'client',
      registrationId: '12345678',
    });

    const client2 = await createClient({
      organizationId: organization2.id,
      name: 'client2',
      registrationId: '123456789',
    });

    expect(client.id).toBeDefined();
    expect(client2.id).toBeDefined();

    const { body: bodyOfFindOneClient1Request } = await request(
      app.getHttpServer(),
    )
      .get(`/v1/clients/${client.id}/organizations/${organization.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .get(`/v1/clients/${client2.id}/organizations/${organization.id}`)
      .set('Authorization', USER2.token)
      .set('Accept', 'application/json')
      .expect(401);

    expect(bodyOfFindOneClient1Request.name).toBe('client');
  });

  it('should be able to get all clients from organization as user', async () => {
    const organization = await createOrganization();
    const organization2 = await createOrganization({
      code: 'BSI_2',
      name: 'BSI_2',
    });

    expect(organization.id).toBeDefined();
    expect(organization2.id).toBeDefined();

    await setUserRoleInOrganization({
      userId: USER.id,
      organizationId: organization.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });
    await setUserRoleInOrganization({
      userId: USER2.id,
      organizationId: organization2.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });

    const client = await createClient({
      organizationId: organization.id,
      name: 'client',
      registrationId: '12345678',
    });

    const client2 = await createClient({
      organizationId: organization.id,
      name: 'client2',
      registrationId: '123456789',
    });

    const client3 = await createClient({
      organizationId: organization2.id,
      name: 'client3',
      registrationId: '123456789',
    });

    expect(client.id).toBeDefined();
    expect(client2.id).toBeDefined();
    expect(client3.id).toBeDefined();

    const { body: bodyOfFindOneClient1Request } = await request(
      app.getHttpServer(),
    )
      .get(`/v1/clients/organizations/${organization.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfFindOneClient1Request.length).toBe(2);
    expect(bodyOfFindOneClient1Request[0].name).toBe('client');
    expect(bodyOfFindOneClient1Request[1].name).toBe('client2');
  });

  it('should be able to remove client', async () => {
    const organization = await createOrganization();
    const organization2 = await createOrganization({
      code: 'BSI_2',
      name: 'BSI_2',
    });
    expect(organization.id).toBeDefined();
    expect(organization2.id).toBeDefined();

    await setUserRoleInOrganization({
      userId: USER.id,
      organizationId: organization.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });
    await setUserRoleInOrganization({
      userId: USER2.id,
      organizationId: organization2.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });

    const client = await createClient({
      organizationId: organization.id,
      name: 'client',
      registrationId: '12345678',
    });

    const client2 = await createClient({
      organizationId: organization.id,
      name: 'client2',
      registrationId: '123456789',
    });
    expect(client.id).toBeDefined();
    expect(client2.id).toBeDefined();

    const { body: bodyOfFindOneClient1Request } = await request(
      app.getHttpServer(),
    )
      .get(`/v1/clients/${client.id}/organizations/${organization.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .get(`/v1/clients/${client2.id}/organizations/${organization2.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(404);

    expect(bodyOfFindOneClient1Request.name).toBe(client.name);

    await request(app.getHttpServer())
      .delete(
        `/v1/clients/${bodyOfFindOneClient1Request.id}/organizations/${organization.id}`,
      )
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/v1/clients/${client2.id}/organizations/${organization2.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .get(`/v1/clients/${client.id}/organizations/${organization.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(404);

    const notRemovedClient = await connectionSource.query(
      `SELECT * FROM clients WHERE id = $1`,
      [client2.id],
    );
    expect(notRemovedClient[0].name).toBe(client2.name);
  });

  it('should be able to update a client', async () => {
    const organization = await createOrganization();
    const organization2 = await createOrganization({
      code: 'BSI_2',
      name: 'BSI_2',
    });

    expect(organization.id).toBeDefined();
    expect(organization2.id).toBeDefined();

    await setUserRoleInOrganization({
      userId: USER.id,
      organizationId: organization.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });
    await setUserRoleInOrganization({
      userId: USER2.id,
      organizationId: organization2.id,
      role: UserEntityTypes.TYPE_COORDINATOR,
    });

    const client = await createClient({
      organizationId: organization.id,
      name: 'client',
      registrationId: '12345678',
    });

    const client2 = await createClient({
      organizationId: organization2.id,
      name: 'client2',
      registrationId: '123456789',
    });

    expect(client.id).toBeDefined();
    expect(client2.id).toBeDefined();

    const { body: bodyOfFindOneClient1Request } = await request(
      app.getHttpServer(),
    )
      .get(`/v1/clients/${client.id}/organizations/${organization.id}`)
      .set('Authorization', USER.token)
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .get(`/v1/clients/${client2.id}/organizations/${organization.id}`)
      .set('Authorization', USER2.token)
      .set('Accept', 'application/json')
      .expect(401);

    expect(bodyOfFindOneClient1Request.name).toBe('client');

    const updatedClient = await updateClient({
      clientId: client.id,
      organizationId: organization.id,
      name: 'new name',
    });

    expect(updatedClient.name).toBe('new name');
  });
});
