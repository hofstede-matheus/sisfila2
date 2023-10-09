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
  attachServiceToDesk,
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
    const organization = await createOrganization();
    const service = await createService();
    const group = await createGroup();
    const desk = await createDesk();
    const queue = await createQueue();

    await importStudentsToGroup();
    await updateQueue();
    await attachServiceToDesk();

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

  it('should able to do a complete flow with 2 queues with different priorities', async () => {
    const organization = await createOrganization();
    const service = await createService();

    const group = await createGroup();
    const group2 = await createGroup({
      name: 'group2',
      organizationId: organization.id,
    });

    const desk = await createDesk();

    const queue = await createQueue();
    const queue2 = await createQueue({
      name: 'queue2',
      description: 'queue2',
      priority: 2,
      code: 'queue2',
      serviceId: service.id,
      organizationId: organization.id,
      groupIds: [group.id],
    });

    await importStudentsToGroup();
    await importStudentsToGroup({
      groupId: group2.id,
      organizationId: organization.id,
      clients: [
        {
          name: 'client3',
          registrationId: '12345',
        },
      ],
    });

    await updateQueue();
    await updateQueue({
      name: 'queue2',
      description: 'queue2',
      priority: 2,
      code: 'queue2',
      serviceId: service.id,
      organizationId: organization.id,
      groups: [group2.id],
    });

    await attachServiceToDesk();

    await enterService('12345678');
    await enterService('123456789');
    await enterService('1234567890');
    await enterService('12345');

    const position1 = await getClientPositionInService({
      registrationId: '12345',
      serviceId: service.body.id,
    });
    let position2 = await getClientPositionInService({
      registrationId: '12345678',
      serviceId: service.body.id,
    });
    let position3 = await getClientPositionInService({
      registrationId: '123456789',
      serviceId: service.body.id,
    });
    const position4 = await getClientPositionInService({
      registrationId: '1234567890',
      serviceId: service.body.id,
    });

    expect(position1.position).toBe(1);
    expect(position2.position).toBe(2);
    expect(position3.position).toBe(3);
    expect(position4.position).toBe(4);

    const getQueueResponse = await getQueue();

    expect(getQueueResponse.body.clients.length).toBe(4);
    expect(getQueueResponse.body.clients[0].registrationId).toBe('12345');
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
  });
});
