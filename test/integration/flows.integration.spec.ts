import { INestApplication } from '@nestjs/common';
import { generateTestingApp, generateUser } from '../helpers';
import { connectionSource } from '../../ormconfig-test';
import moment from 'moment';
import {
  createGroup,
  createOrganization,
  createQueue,
  createService,
  importStudentsToGroup,
  _init,
  enterService,
  getQueue,
  createDesk,
  attachDeskToService,
  callNextOnDesk,
  updateQueue,
  getClientPositionInService,
} from './helpers';

describe('flows', () => {
  let app: INestApplication;
  let USER: { token: string; email: string; id: string };

  const opensAt = moment().toDate();
  const closesAt = moment().add(1, 'day').add(1, 'hour').toDate();

  connectionSource.initialize();

  beforeAll(async () => {
    app = await generateTestingApp();
    await app.init();
    USER = await generateUser(app);
    _init(app, USER, opensAt, closesAt);
  });

  afterAll(async () => {
    await connectionSource.query(`DELETE FROM users`);
    await app.close();
    await connectionSource.destroy();
  });

  afterEach(async () => {
    await connectionSource.query(`DELETE FROM organizations`);
    await connectionSource.query(`DELETE FROM clients`);
  });

  it('should able to do a complete flow simple', async () => {
    /* ------------------COORDINATOR------------------*/

    const organization = await createOrganization();
    const service = await createService();
    const group = await createGroup();
    const desk = await createDesk();
    const queue = await createQueue();

    await importStudentsToGroup();
    await updateQueue();
    await attachDeskToService();

    /* ------------------ALUNOS------------------*/

    await enterService('12345678');
    await enterService('123456789');
    await enterService('1234567890');

    const position1 = await getClientPositionInService({
      registrationId: '12345678',
      serviceId: service.body.id,
    });
    let position2 = await getClientPositionInService({
      registrationId: '123456789',
      serviceId: service.body.id,
    });
    let position3 = await getClientPositionInService({
      registrationId: '1234567890',
      serviceId: service.body.id,
    });

    expect(position1.position).toBe(1);
    expect(position2.position).toBe(2);
    expect(position3.position).toBe(3);

    /* ------------------COORDINATOR------------------*/

    const getQueueResponse = await getQueue();

    expect(getQueueResponse.body.clients.length).toBe(3);
    expect(getQueueResponse.body.clients[0].registrationId).toBe('12345678');
    expect(getQueueResponse.body.clients[1].registrationId).toBe('123456789');
    expect(getQueueResponse.body.clients[2].registrationId).toBe('1234567890');

    await callNextOnDesk();

    position2 = await getClientPositionInService({
      registrationId: '123456789',
      serviceId: service.body.id,
    });
    position3 = await getClientPositionInService({
      registrationId: '1234567890',
      serviceId: service.body.id,
    });

    expect(position2.position).toBe(1);
    expect(position3.position).toBe(2);

    const getQueueResponse2 = await getQueue();

    expect(getQueueResponse2.body.clients.length).toBe(2);
    expect(getQueueResponse2.body.clients[0].registrationId).toBe('123456789');
    expect(getQueueResponse2.body.clients[1].registrationId).toBe('1234567890');
    expect(getQueueResponse2.body.lastClientCalled.registrationId).toBe(
      '12345678',
    );

    await callNextOnDesk();

    position3 = await getClientPositionInService({
      registrationId: '1234567890',
      serviceId: service.body.id,
    });

    expect(position3.position).toBe(1);

    const getQueueResponse3 = await getQueue();

    expect(getQueueResponse3.body.clients.length).toBe(1);
    expect(getQueueResponse3.body.clients[0].registrationId).toBe('1234567890');
    expect(getQueueResponse3.body.lastClientCalled.registrationId).toBe(
      '123456789',
    );
  });

  // it('should able to do a complete flow calling next 2 times', async () => {
  //   /* ------------------COORDINATOR------------------*/

  //   // create organization
  //   const createOrganizationResponse = await request(app.getHttpServer())
  //     .post('/v1/organizations')
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'Instituto de Computação',
  //       code: 'ICUFBA',
  //     } as CreateOrganizationRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // attach USER to organization as coordinator
  //   await request(app.getHttpServer())
  //     .patch(
  //       `/v1/users/${USER.id}/organizations/${createOrganizationResponse.body.id}`,
  //     )
  //     .set('Authorization', USER.token)
  //     .send({
  //       role: 'TYPE_COORDINATOR',
  //     } as SetUserRoleInOrganizationRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // create new service
  //   const createServiceResponse = await request(app.getHttpServer())
  //     .post('/v1/services')
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'Matrícula BSI',
  //       subscriptionToken: 'BSI-2023-2',
  //       guestEnrollment: true,
  //       opensAt: opensAt.toISOString(),
  //       closesAt: closesAt.toISOString(),
  //       organizationId: createOrganizationResponse.body.id,
  //     } as CreateServiceRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // create new group
  //   const createGroupResponse = await request(app.getHttpServer())
  //     .post('/v1/groups')
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'BSI_GRUPO_1',
  //       organizationId: createOrganizationResponse.body.id,
  //     } as CreateGroupRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // import students to a group
  //   await request(app.getHttpServer())
  //     .post(`/v1/groups/import`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       groupId: createGroupResponse.body.id,
  //       clients: [
  //         {
  //           name: VALID_CLIENT.name,
  //           registrationId: '12345678',
  //         },
  //         {
  //           name: VALID_CLIENT.name,
  //           registrationId: '123456789',
  //         },
  //         {
  //           name: VALID_CLIENT.name,
  //           registrationId: '1234567890',
  //         },
  //       ],
  //       organizationId: createOrganizationResponse.body.id,
  //     } as ImportClientsRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // create queue
  //   const createQueueResponse = await request(app.getHttpServer())
  //     .post(`/v1/queues/`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'queue',
  //       description: 'queue',
  //       priority: 1,
  //       code: 'queue',
  //       organizationId: createOrganizationResponse.body.id,
  //       serviceId: createServiceResponse.body.id,
  //     } as CreateQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // attach group to queue
  //   await request(app.getHttpServer())
  //     .patch(
  //       `/v1/queues/${createQueueResponse.body.id}/organizations/${createOrganizationResponse.body.id}`,
  //     )
  //     .set('Authorization', USER.token)
  //     .send({
  //       groups: [createGroupResponse.body.id],
  //     } as AttachGroupsToQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   /* ------------------ALUNOS------------------*/

  //   // enter queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/enter`)
  //     .send({
  //       registrationId: '12345678',
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as EnterQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/enter`)
  //     .send({
  //       registrationId: '123456789',
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as EnterQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/enter`)
  //     .send({
  //       registrationId: '1234567890',
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as EnterQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   /* ------------------COORDINATOR------------------*/

  //   // get queue
  //   const getQueueResponse = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse.body.clients.length).toBe(3);
  //   expect(getQueueResponse.body.clients[0].registrationId).toBe('12345678');
  //   expect(getQueueResponse.body.clients[1].registrationId).toBe('123456789');
  //   expect(getQueueResponse.body.clients[2].registrationId).toBe('1234567890');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse2 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse2.body.clients.length).toBe(2);
  //   expect(getQueueResponse2.body.clients[0].registrationId).toBe('123456789');
  //   expect(getQueueResponse2.body.clients[1].registrationId).toBe('1234567890');
  //   expect(getQueueResponse2.body.lastClientCalled.registrationId).toBe(
  //     '12345678',
  //   );

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse3 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse3.body.clients.length).toBe(1);
  //   expect(getQueueResponse3.body.clients[0].registrationId).toBe('1234567890');
  //   expect(getQueueResponse3.body.lastClientCalled.registrationId).toBe(
  //     '123456789',
  //   );
  // });

  // it('should able to do a complete flow calling multiple times', async () => {
  //   /* ------------------COORDINATOR------------------*/

  //   // create organization
  //   const createOrganizationResponse = await request(app.getHttpServer())
  //     .post('/v1/organizations')
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'Instituto de Computação',
  //       code: 'ICUFBA',
  //     } as CreateOrganizationRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // attach USER to organization as coordinator
  //   await request(app.getHttpServer())
  //     .patch(
  //       `/v1/users/${USER.id}/organizations/${createOrganizationResponse.body.id}`,
  //     )
  //     .set('Authorization', USER.token)
  //     .send({
  //       role: 'TYPE_COORDINATOR',
  //     } as SetUserRoleInOrganizationRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // create new service
  //   const createServiceResponse = await request(app.getHttpServer())
  //     .post('/v1/services')
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'Matrícula BSI',
  //       subscriptionToken: 'BSI-2023-2',
  //       guestEnrollment: true,
  //       opensAt: opensAt.toISOString(),
  //       closesAt: closesAt.toISOString(),
  //       organizationId: createOrganizationResponse.body.id,
  //     } as CreateServiceRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // create new group
  //   const createGroupResponse = await request(app.getHttpServer())
  //     .post('/v1/groups')
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'BSI_GRUPO_1',
  //       organizationId: createOrganizationResponse.body.id,
  //     } as CreateGroupRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // import students to a group
  //   await request(app.getHttpServer())
  //     .post(`/v1/groups/import`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       groupId: createGroupResponse.body.id,
  //       clients: [
  //         {
  //           name: VALID_CLIENT.name,
  //           registrationId: '12345678',
  //         },
  //         {
  //           name: VALID_CLIENT.name,
  //           registrationId: '123456789',
  //         },
  //         {
  //           name: VALID_CLIENT.name,
  //           registrationId: '1234567890',
  //         },
  //       ],
  //       organizationId: createOrganizationResponse.body.id,
  //     } as ImportClientsRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // create queue
  //   const createQueueResponse = await request(app.getHttpServer())
  //     .post(`/v1/queues/`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       name: 'queue',
  //       description: 'queue',
  //       priority: 1,
  //       code: 'queue',
  //       organizationId: createOrganizationResponse.body.id,
  //       serviceId: createServiceResponse.body.id,
  //     } as CreateQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(201);

  //   // attach group to queue
  //   await request(app.getHttpServer())
  //     .patch(
  //       `/v1/queues/${createQueueResponse.body.id}/organizations/${createOrganizationResponse.body.id}`,
  //     )
  //     .set('Authorization', USER.token)
  //     .send({
  //       groups: [createGroupResponse.body.id],
  //     } as AttachGroupsToQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   /* ------------------ALUNOS------------------*/

  //   // enter queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/services/enter`)
  //     .send({
  //       registrationId: '12345678',
  //       organizationId: createOrganizationResponse.body.id,
  //       serviceId: createServiceResponse.body.id,
  //     } as EnterServiceRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   await request(app.getHttpServer())
  //     .patch(`/v1/services/enter`)
  //     .send({
  //       registrationId: '123456789',
  //       organizationId: createOrganizationResponse.body.id,
  //       serviceId: createServiceResponse.body.id,
  //     } as EnterServiceRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   await request(app.getHttpServer())
  //     .patch(`/v1/services/enter`)
  //     .send({
  //       registrationId: '1234567890',
  //       organizationId: createOrganizationResponse.body.id,
  //       serviceId: createServiceResponse.body.id,
  //     } as EnterServiceRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   /* ------------------COORDINATOR------------------*/

  //   // get queue
  //   const getQueueResponse = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse.body.clients.length).toBe(3);
  //   expect(getQueueResponse.body.clients[0].registrationId).toBe('12345678');
  //   expect(getQueueResponse.body.clients[1].registrationId).toBe('123456789');
  //   expect(getQueueResponse.body.clients[2].registrationId).toBe('1234567890');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse2 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse2.body.clients.length).toBe(2);
  //   expect(getQueueResponse2.body.clients[0].registrationId).toBe('123456789');
  //   expect(getQueueResponse2.body.clients[1].registrationId).toBe('1234567890');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse3 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse3.body.clients.length).toBe(1);
  //   expect(getQueueResponse3.body.clients[0].registrationId).toBe('1234567890');

  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/enter`)
  //     .send({
  //       registrationId: '12345678',
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as EnterQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse4 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse4.body.clients.length).toBe(2);
  //   expect(getQueueResponse4.body.clients[0].registrationId).toBe('1234567890');
  //   expect(getQueueResponse4.body.clients[1].registrationId).toBe('12345678');

  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/enter`)
  //     .send({
  //       registrationId: '123456789',
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as EnterQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse5 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse5.body.clients.length).toBe(3);
  //   expect(getQueueResponse5.body.clients[0].registrationId).toBe('1234567890');
  //   expect(getQueueResponse5.body.clients[1].registrationId).toBe('12345678');
  //   expect(getQueueResponse5.body.clients[2].registrationId).toBe('123456789');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse6 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse6.body.clients.length).toBe(2);
  //   expect(getQueueResponse6.body.clients[0].registrationId).toBe('12345678');
  //   expect(getQueueResponse6.body.clients[1].registrationId).toBe('123456789');

  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/enter`)
  //     .send({
  //       registrationId: '12345678',
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as EnterQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse7 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse7.body.clients.length).toBe(3);
  //   expect(getQueueResponse7.body.clients[0].registrationId).toBe('12345678');
  //   expect(getQueueResponse7.body.clients[1].registrationId).toBe('123456789');
  //   expect(getQueueResponse7.body.clients[2].registrationId).toBe('12345678');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse8 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse8.body.clients.length).toBe(2);
  //   expect(getQueueResponse8.body.clients[0].registrationId).toBe('123456789');
  //   expect(getQueueResponse8.body.clients[1].registrationId).toBe('12345678');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse9 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse9.body.clients.length).toBe(1);
  //   expect(getQueueResponse9.body.clients[0].registrationId).toBe('12345678');

  //   // call next on queue
  //   await request(app.getHttpServer())
  //     .patch(`/v1/queues/next`)
  //     .set('Authorization', USER.token)
  //     .send({
  //       organizationId: createOrganizationResponse.body.id,
  //       queueId: createQueueResponse.body.id,
  //     } as CallNextOnQueueRequest)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   // get queue
  //   const getQueueResponse10 = await request(app.getHttpServer())
  //     .get(`/v1/queues/${createQueueResponse.body.id}`)
  //     .set('Accept', 'application/json')
  //     .expect(200);

  //   expect(getQueueResponse10.body.clients.length).toBe(0);
  // });
});
