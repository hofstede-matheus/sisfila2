import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  generateTestingApp,
  generateUser,
  VALID_CLIENT,
  VALID_ORGANIZATION,
} from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import { CreateOrganizationRequest } from '../../src/modules/organizations/presentation/http/dto/CreateOrganization';
import { CreateClientRequest } from '../../src/modules/clients/presentation/http/dto/CreateClient';
import { CreateGroupRequest } from '../../src/modules/groups/presentation/http/dto/CreateGroup';
import { ImportClientsRequest } from '../../src/modules/groups/presentation/http/dto/ImportClients';
import * as moment from 'moment';
import { AttachGroupsToQueueRequest } from '../../src/modules/queues/presentation/http/dto/UpdateQueue';
import { CreateQueueRequest } from '../../src/modules/queues/presentation/http/dto/CreateQueue';
import { CreateServiceRequest } from '../../src/modules/services/presentation/http/dto/CreateService';
import { CallNextOnQueueRequest } from '../../src/modules/queues/presentation/http/dto/CallNextOnQueue';
import { EnterServiceRequest } from '../../src/modules/services/presentation/http/dto/EnterService';

describe('queue', () => {
  let app: INestApplication;
  let USER: { token: string; email: string; id: string };
  let USER2: { token: string; email: string; id: string };

  const opensAt = moment().toDate();
  const closesAt = moment().add(1, 'hour').toDate();

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
    await connectionSource.query(`DELETE FROM queues`);
    jest.useRealTimers();
  });

  it('client should be able to enter queue with guestEnrollment = true', async () => {
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

    const { body: bodyOfCreateClient1Request } = await request(
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

    expect(bodyOfCreateClient1Request.id).toBeDefined();

    const { body: bodyOfCreateClient2Request } = await request(
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

    expect(bodyOfCreateClient2Request.id).toBeDefined();

    const { body: bodyOfCreateClient3Request } = await request(
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

    expect(bodyOfCreateClient3Request.id).toBeDefined();

    const { body: bodyOfCreateServiceRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/services')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        subscriptionToken: '12345678',
        guestEnrollment: true,
        organizationId: bodyOfCreateOrganizationRequest.id,
        opensAt: opensAt.toISOString(),
        closesAt: closesAt.toISOString(),
      })
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateServiceRequest.id).toBeDefined();

    const { body: bodyOfCreateQueueRequest } = await request(
      app.getHttpServer(),
    )
      .post(`/v1/queues/`)
      .set('Authorization', USER.token)
      .send({
        name: 'queue',
        description: 'queue',
        priority: 1,
        code: 'queue',
        organizationId: bodyOfCreateOrganizationRequest.id,
        serviceId: bodyOfCreateServiceRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: bodyOfCreateGroupRequest.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '12345678',
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '123456789',
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '1234567890',
          },
        ],
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/v1/queues/${bodyOfCreateQueueRequest.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        groups: [bodyOfCreateGroupRequest.id],
      })
      .set('Accept', 'application/json')
      .expect(200);

    // CLIENT WITHOUT AUTH

    await request(app.getHttpServer())
      .patch(`/v1/services/enter`)
      .send({
        registrationId: '12345678',
        organizationId: bodyOfCreateOrganizationRequest.id,
        serviceId: bodyOfCreateServiceRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/v1/services/enter`)
      .send({
        registrationId: '123456789',
        organizationId: bodyOfCreateOrganizationRequest.id,
        serviceId: bodyOfCreateServiceRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/v1/services/enter`)
      .send({
        registrationId: '1234567890',
        organizationId: bodyOfCreateOrganizationRequest.id,
        serviceId: bodyOfCreateServiceRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    const { body: bodyOfGetQueueRequest } = await request(app.getHttpServer())
      .get(`/v1/queues/${bodyOfCreateQueueRequest.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetQueueRequest.clients.length).toBe(3);
    expect(bodyOfGetQueueRequest.clients[0].registrationId).toBe('12345678');
    expect(bodyOfGetQueueRequest.clients[1].registrationId).toBe('123456789');
    expect(bodyOfGetQueueRequest.clients[2].registrationId).toBe('1234567890');
  });

  it('client should not be able to enter queue when he is not inside a group attached to this queue', async () => {
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

    const { body: bodyOfCreateServiceRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/services')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        subscriptionToken: '12345678',
        guestEnrollment: true,
        organizationId: bodyOfCreateOrganizationRequest.id,
        opensAt: opensAt.toISOString(),
        closesAt: closesAt.toISOString(),
      })
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateServiceRequest.id).toBeDefined();

    const { body: bodyOfCreateQueueRequest } = await request(
      app.getHttpServer(),
    )
      .post(`/v1/queues/`)
      .set('Authorization', USER.token)
      .send({
        name: 'queue',
        description: 'queue',
        priority: 1,
        code: 'queue',
        organizationId: bodyOfCreateOrganizationRequest.id,
        serviceId: bodyOfCreateServiceRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: bodyOfCreateGroupRequest.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '12345678',
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '123456789',
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '1234567890',
          },
        ],
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    // NOT ATTACHED TO QUEUE GROUP

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '12345678',
        organizationId: bodyOfCreateOrganizationRequest.id,
        queueId: bodyOfCreateQueueRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '123456789',
        organizationId: bodyOfCreateOrganizationRequest.id,
        queueId: bodyOfCreateQueueRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '1234567890',
        organizationId: bodyOfCreateOrganizationRequest.id,
        queueId: bodyOfCreateQueueRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(401);

    const { body: bodyOfGetQueueRequest } = await request(app.getHttpServer())
      .get(`/v1/queues/${bodyOfCreateQueueRequest.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetQueueRequest.clients.length).toBe(0);
  });

  it('client should not be able to enter queue when service is not open', async () => {
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

    // mock time
    jest
      .useFakeTimers({
        doNotFake: [
          'nextTick',
          'setImmediate',
          'clearImmediate',
          'setInterval',
          'clearInterval',
          'setTimeout',
          'clearTimeout',
        ],
      })
      .setSystemTime(moment().add(2, 'hour').toDate());

    const { body: bodyOfCreateServiceRequest } = await request(
      app.getHttpServer(),
    )
      .post('/v1/services')
      .set('Authorization', USER.token)
      .send({
        name: VALID_CLIENT.name,
        subscriptionToken: '12345678',
        guestEnrollment: true,
        organizationId: bodyOfCreateOrganizationRequest.id,
        opensAt,
        closesAt,
      })
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateServiceRequest.id).toBeDefined();

    const { body: bodyOfCreateQueueRequest } = await request(
      app.getHttpServer(),
    )
      .post(`/v1/queues/`)
      .set('Authorization', USER.token)
      .send({
        name: 'queue',
        description: 'queue',
        priority: 1,
        code: 'queue',
        organizationId: bodyOfCreateOrganizationRequest.id,
        serviceId: bodyOfCreateServiceRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(201);

    expect(bodyOfCreateGroupRequest.id).toBeDefined();

    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: bodyOfCreateGroupRequest.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '12345678',
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '123456789',
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '1234567890',
          },
        ],
        organizationId: bodyOfCreateOrganizationRequest.id,
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/v1/queues/${bodyOfCreateQueueRequest.id}/organizations/${bodyOfCreateOrganizationRequest.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        groups: [bodyOfCreateGroupRequest.id],
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '12345678',
        organizationId: bodyOfCreateOrganizationRequest.id,
        queueId: bodyOfCreateQueueRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '123456789',
        organizationId: bodyOfCreateOrganizationRequest.id,
        queueId: bodyOfCreateQueueRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '1234567890',
        organizationId: bodyOfCreateOrganizationRequest.id,
        queueId: bodyOfCreateQueueRequest.id,
      })
      .set('Accept', 'application/json')
      .expect(401);

    const { body: bodyOfGetQueueRequest } = await request(app.getHttpServer())
      .get(`/v1/queues/${bodyOfCreateQueueRequest.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(bodyOfGetQueueRequest.clients.length).toBe(0);
  });
});
