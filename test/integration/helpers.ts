import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateOrganizationRequest } from '../../src/modules/organizations/presentation/http/dto/CreateOrganization';
import { CreateServiceRequest } from '../../src/modules/services/presentation/http/dto/CreateService';
import { CreateGroupRequest } from '../../src/modules/groups/presentation/http/dto/CreateGroup';
import { VALID_CLIENT } from '../helpers';
import { ImportClientsRequest } from '../../src/modules/groups/presentation/http/dto/ImportClients';
import { CreateQueueRequest } from '../../src/modules/queues/presentation/http/dto/CreateQueue';
import { EnterServiceRequest } from '../../src/modules/services/presentation/http/dto/EnterService';
import { CreateDeskRequest } from '../../src/modules/desk/presentation/http/dto/CreateDesk';
import { UpdateDeskRequest } from '../../src/modules/desk/presentation/http/dto/UpdateDesk';
import { CreateClientRequest } from '../../src/modules/clients/presentation/http/dto/CreateClient';
import { UserEntityTypes } from '../../src/modules/users/domain/entities/User.entity';
import { UpdateClientRequest } from '../../src/modules/clients/presentation/http/dto/UpdateClient';
import moment from 'moment';
import { UpdateQueueRequest } from '../../src/modules/queues/presentation/http/dto/UpdateQueue';

let app = null;
let USER = null;
let opensAt = null;
let closesAt = null;

let organization = null;
let client = null;
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

export async function createOrganization(
  { name, code } = {
    name: 'BSI',
    code: 'BSI',
  } as {
    name?: string;
    code?: string;
  },
) {
  organization = await request(app.getHttpServer())
    .post('/v1/admin/organizations')
    .set('Authorization', USER.token)
    .send({
      name,
      code,
    } as CreateOrganizationRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return organization.body;
}

export async function createClient(
  { name, organizationId, registrationId } = {
    name: 'client',
    organizationId: organization.body.id,
    registrationId: '12345678',
  } as {
    name?: string;
    organizationId?: string;
    registrationId?: string;
  },
) {
  client = await request(app.getHttpServer())
    .post('/v1/clients')
    .set('Authorization', USER.token)
    .send({
      name,
      organizationId,
      registrationId,
    } as CreateClientRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return client.body;
}

export async function setUserRoleInOrganization(
  { userId, organizationId, role } = {
    userId: USER.id,
    organizationId: organization.body.id,
    role: UserEntityTypes.TYPE_COORDINATOR,
  } as {
    userId?: string;
    organizationId?: string;
    role?: UserEntityTypes;
  },
) {
  return await request(app.getHttpServer())
    .patch(`/v1/users/${userId}/organizations/${organizationId}`)
    .set('Authorization', USER.token)
    .send({
      role,
    })
    .set('Accept', 'application/json')
    .expect(200);
}

export async function updateClient(
  { name, organizationId, clientId } = {
    name: 'client',
    organizationId: organization.body.id,
    clientId: client.body.id,
  } as {
    name?: string;
    organizationId?: string;
    clientId?: string;
  },
) {
  client = await request(app.getHttpServer())
    .patch(`/v1/clients/${clientId}/organizations/${organizationId}`)
    .set('Authorization', USER.token)
    .send({
      name,
    } as UpdateClientRequest)
    .set('Accept', 'application/json')
    .expect(200);

  return client.body;
}

export async function createService(
  {
    name,
    subscriptionToken,
    guestEnrollment,
    opensAt,
    closesAt,
    organizationId,
  } = {
    name: 'BSI',
    subscriptionToken: 'BSI',
    guestEnrollment: true,
    opensAt: moment().toString(),
    closesAt: moment().add(1, 'day').add(1, 'hour').toString(),
    organizationId: organization.body.id,
  } as {
    name?: string;
    subscriptionToken?: string;
    guestEnrollment?: boolean;
    opensAt?: string;
    closesAt?: string;
    organizationId?: string;
  },
) {
  service = await request(app.getHttpServer())
    .post('/v1/admin/services')
    .set('Authorization', USER.token)
    .send({
      name,
      subscriptionToken,
      guestEnrollment,
      opensAt,
      closesAt,
      organizationId,
    } as CreateServiceRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return service;
}

export async function updateQueue(
  { name, description, code, priority, groups, serviceId, organizationId } = {
    name: queue.body.name,
    description: queue.body.description,
    code: queue.body.code,
    priority: queue.body.priority,
    groups: [group.body.id],
    serviceId: service.body.id,
    organizationId: organization.body.id,
  } as {
    name?: string;
    description?: string;
    code?: string;
    priority?: number;
    groups?: string[];
    serviceId?: string;
    organizationId?: string;
  },
) {
  queue = await request(app.getHttpServer())
    .patch(`/v1/queues/${queue.body.id}/organizations/${organizationId}`)
    .set('Authorization', USER.token)
    .send({
      name,
      description,
      code,
      priority,
      groups,
      serviceId,
    } as UpdateQueueRequest)
    .set('Accept', 'application/json')
    .expect(200);
  return queue.body;
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
      groupIds: [group.body.id],
    } as CreateQueueRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return queue;
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
// /v1/services/{serviceId}/position/{registrationId}": {
//   "get": {
//     "operationId": "ServiceController_getClientPositionInService",
//     "parameters": [
//       {
//         "name": "serviceId",
//         "required": true,
//         "in": "path",
//         "schema": {
//           "type": "string"
//         }
//       },
//       {
//         "name": "registrationId",
//         "required": true,
//         "in": "path",
//         "schema": {
//           "type": "string"
//         }
//       }
//     ],
//     "responses": {
//       "default": {
//         "description": "",
//         "content": {
//           "application/json": {
//             "schema": {
//               "type": "number"
//             }
//           }
//         }
//       }
//     }
//   }
// },
export async function getClientPositionInService(
  { serviceId, registrationId } = {
    serviceId: service.body.id,
    registrationId: client.body.registrationId,
  } as {
    serviceId?: string;
    registrationId?: string;
  },
) {
  const getClientPositionInServiceResponse = await request(app.getHttpServer())
    .get(`/v1/services/${serviceId}/position/${registrationId}`)
    .set('Accept', 'application/json')
    .expect(200);

  return getClientPositionInServiceResponse.body;
}
