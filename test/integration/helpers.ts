import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateOrganizationRequest } from '../../src/modules/organizations/presentation/http/dto/CreateOrganization';
import { CreateServiceRequest } from '../../src/modules/services/presentation/http/dto/CreateService';
import { CreateGroupRequest } from '../../src/modules/groups/presentation/http/dto/CreateGroup';
import { VALID_CLIENT } from '../helpers';
import { ImportClientsRequest } from '../../src/modules/groups/presentation/http/dto/ImportClients';
import { CreateQueueRequest } from '../../src/modules/queues/presentation/http/dto/CreateQueue';
import { AttachGroupsToQueueRequest } from '../../src/modules/queues/presentation/http/dto/UpdateQueue';
import { EnterServiceRequest } from '../../src/modules/services/presentation/http/dto/EnterService';
import { CreateDeskRequest } from '../../src/modules/desk/presentation/http/dto/CreateDesk';
import { UpdateDeskRequest } from '../../src/modules/desk/presentation/http/dto/UpdateDesk';

interface Context {
  app: INestApplication;
  USER: { token: string; email: string; id: string };
  opensAt: Date;
  closesAt: Date;
}

let app = null;
let USER = null;
let opensAt = null;
let closesAt = null;

let organization = null;
let service = null;
let group = null;
let queue = null;
let desk = null;

export const _init = (
  _app: INestApplication,
  _USER: { token: string; email: string; id: string },
  _opensAt: Date,
  _closesAt: Date,
) => {
  app = _app;
  USER = _USER;
  opensAt = _opensAt;
  closesAt = _closesAt;
};

export async function createOrganization() {
  organization = await request(app.getHttpServer())
    .post('/v1/organizations')
    .set('Authorization', USER.token)
    .send({
      name: 'Instituto de Computação',
      code: 'ICUFBA',
    } as CreateOrganizationRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return organization;
}

export async function createService() {
  service = await request(app.getHttpServer())
    .post('/v1/services')
    .set('Authorization', USER.token)
    .send({
      name: 'Matrícula BSI',
      subscriptionToken: 'BSI-2023-2',
      guestEnrollment: true,
      opensAt: opensAt.toISOString(),
      closesAt: closesAt.toISOString(),
      organizationId: organization.body.id,
    } as CreateServiceRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return service;
}

export async function createGroup() {
  group = await request(app.getHttpServer())
    .post('/v1/groups')
    .set('Authorization', USER.token)
    .send({
      name: 'BSI_GRUPO_1',
      organizationId: organization.body.id,
    } as CreateGroupRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return group;
}

export async function importStudentsToGroup() {
  const importResult = await request(app.getHttpServer())
    .post(`/v1/groups/import`)
    .set('Authorization', USER.token)
    .send({
      groupId: group.body.id,
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
      organizationId: organization.body.id,
    } as ImportClientsRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return importResult;
}

export async function createDesk() {
  desk = await request(app.getHttpServer())
    .post('/v1/desks')
    .set('Authorization', USER.token)
    .send({
      name: 'BSI_MESA_1',
      organizationId: organization.body.id,
    } as CreateDeskRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return desk;
}

export async function attachDeskToService() {
  const attachDeskToServiceResponse = await request(app.getHttpServer())
    .patch(`/v1/desks/${desk.body.id}`)
    .set('Authorization', USER.token)
    .send({
      services: [service.body.id],
    } as UpdateDeskRequest)
    .set('Accept', 'application/json')
    .expect(200);

  return attachDeskToServiceResponse;
}

export async function createQueue() {
  queue = await request(app.getHttpServer())
    .post(`/v1/queues/`)
    .set('Authorization', USER.token)
    .send({
      name: 'queue',
      description: 'queue',
      priority: 1,
      code: 'queue',
      organizationId: organization.body.id,
      serviceId: service.body.id,
    } as CreateQueueRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return queue;
}

export async function attachGroupToQueue() {
  const attachGroupToQueueResponse = await request(app.getHttpServer())
    .patch(`/v1/queues/${queue.body.id}/organizations/${organization.body.id}`)
    .set('Authorization', USER.token)
    .send({
      groups: [group.body.id],
    } as AttachGroupsToQueueRequest)
    .set('Accept', 'application/json')
    .expect(200);

  return attachGroupToQueueResponse;
}

export async function enterService(registrationId: string) {
  const enterServiceResponse = await request(app.getHttpServer())
    .patch(`/v1/services/enter`)
    .send({
      registrationId,
      organizationId: organization.body.id,
      serviceId: service.body.id,
    } as EnterServiceRequest)
    .set('Accept', 'application/json')
    .expect(200);

  return enterServiceResponse;
}

export async function getQueue() {
  return await request(app.getHttpServer())
    .get(`/v1/queues/${queue.body.id}`)
    .set('Accept', 'application/json')
    .expect(200);
}

export async function callNextOnDesk() {
  const callNextOnDeskResponse = await request(app.getHttpServer())
    .patch(`/v1/desks/${desk.body.id}/next`)
    .set('Authorization', USER.token)
    .set('Accept', 'application/json')
    .expect(200);

  return callNextOnDeskResponse;
}
