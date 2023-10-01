import { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
import moment from 'moment';
import { _init, createGroup, createOrganization, createQueue } from './helpers';

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
    _init(app, USER, opensAt, closesAt);
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

  it('should create a queue', async () => {
    const organization = await createOrganization();
    const group = await createGroup();
    const queue = await createQueue();

    // ... TODO
  });
});
