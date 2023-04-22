import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { generateTestingApp, generateUser, VALID_CLIENT } from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import { CreateOrganizationRequest } from '../../src/presentation/http/dto/CreateOrganization';
import { CreateServiceRequest } from '../../src/presentation/http/dto/CreateService';
import { CreateGroupRequest } from '../../src/presentation/http/dto/CreateGroup';
import { ImportClientsRequest } from '../../src/presentation/http/dto/ImportClients';

describe('flows', () => {
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
    await connectionSource.query(`DELETE FROM users`);
    await connectionSource.query(`DELETE FROM organizations`);
    await connectionSource.query(`DELETE FROM clients`);
  });

  it('should able to do a complete flow', async () => {
    /* ------------------COORDINATOR------------------*/

    // create organization
    const createOrganizationResponse = await request(app.getHttpServer())
      .post('/v1/organizations')
      .set('Authorization', USER.token)
      .send({
        name: 'Instituto de Computação',
        code: 'ICUFBA',
      } as CreateOrganizationRequest)
      .set('Accept', 'application/json')
      .expect(201);

    // attach USER to organization as coordinator
    await request(app.getHttpServer())
      .patch(
        `/v1/users/${USER.id}/organizations/${createOrganizationResponse.body.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        role: 'TYPE_COORDINATOR',
      })
      .set('Accept', 'application/json')
      .expect(200);

    // create new service
    const createServiceResponse = await request(app.getHttpServer())
      .post('/v1/services')
      .set('Authorization', USER.token)
      .send({
        name: 'Matrícula BSI',
        subscriptionToken: 'BSI-2023-2',
        guestEnrollment: true,
        opensAt: new Date(),
        closesAt: new Date(),
        organizationId: createOrganizationResponse.body.id,
      } as CreateServiceRequest)
      .set('Accept', 'application/json')
      .expect(201);

    // create new group
    const createGroupResponse = await request(app.getHttpServer())
      .post('/v1/groups')
      .set('Authorization', USER.token)
      .send({
        name: 'BSI_GRUPO_1',
        organizationId: createOrganizationResponse.body.id,
      } as CreateGroupRequest)
      .set('Accept', 'application/json')
      .expect(201);

    // import students to a group
    await request(app.getHttpServer())
      .post(`/v1/groups/import`)
      .set('Authorization', USER.token)
      .send({
        groupId: createGroupResponse.body.id,
        clients: [
          {
            name: VALID_CLIENT.name,
            registrationId: '12345678',
            organizationId: createOrganizationResponse.body.id,
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '123456789',
            organizationId: createOrganizationResponse.body.id,
          },
          {
            name: VALID_CLIENT.name,
            registrationId: '1234567890',
            organizationId: createOrganizationResponse.body.id,
          },
        ],
      } as ImportClientsRequest)
      .set('Accept', 'application/json')
      .expect(201);

    // create queue
    const createQueueResponse = await request(app.getHttpServer())
      .post(`/v1/queues/`)
      .set('Authorization', USER.token)
      .send({
        name: 'queue',
        description: 'queue',
        priority: 1,
        code: 'queue',
        organizationId: createOrganizationResponse.body.id,
        serviceId: createServiceResponse.body.id,
      })
      .set('Accept', 'application/json')
      .expect(201);

    // attach group to queue
    await request(app.getHttpServer())
      .patch(
        `/v1/queues/${createQueueResponse.body.id}/organizations/${createOrganizationResponse.body.id}`,
      )
      .set('Authorization', USER.token)
      .send({
        groups: [createGroupResponse.body.id],
      })
      .set('Accept', 'application/json')
      .expect(200);

    /* ------------------ALUNOS------------------*/

    // enter queue
    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '12345678',
        organizationId: createOrganizationResponse.body.id,
        queueId: createQueueResponse.body.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '123456789',
        organizationId: createOrganizationResponse.body.id,
        queueId: createQueueResponse.body.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/v1/queues/enter`)
      .send({
        registrationId: '1234567890',
        organizationId: createOrganizationResponse.body.id,
        queueId: createQueueResponse.body.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    /* ------------------COORDINATOR------------------*/

    // get queue
    const getQueueResponse = await request(app.getHttpServer())
      .get(`/v1/queues/${createQueueResponse.body.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(getQueueResponse.body.clients.length).toBe(3);
    expect(getQueueResponse.body.clients[0].registrationId).toBe('12345678');
    expect(getQueueResponse.body.clients[1].registrationId).toBe('123456789');
    expect(getQueueResponse.body.clients[2].registrationId).toBe('1234567890');

    // call next on queue
    await request(app.getHttpServer())
      .patch(`/v1/queues/next`)
      .set('Authorization', USER.token)
      .send({
        organizationId: createOrganizationResponse.body.id,
        queueId: createQueueResponse.body.id,
      })
      .set('Accept', 'application/json')
      .expect(200);

    // get queue
    const getQueueResponse2 = await request(app.getHttpServer())
      .get(`/v1/queues/${createQueueResponse.body.id}`)
      .set('Accept', 'application/json')
      .expect(200);

    expect(getQueueResponse2.body.clients.length).toBe(2);
    expect(getQueueResponse2.body.clients[0].registrationId).toBe('123456789');
    expect(getQueueResponse2.body.clients[1].registrationId).toBe('1234567890');
  });
});
