import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Group } from '../src/modules/groups/data/typeorm/entities/groups.typeorm-entity';
import { Organization } from '../src/modules/organizations/data/typeorm/entities/organizations.typeorm-entity';
import { Queue } from '../src/modules/queues/data/typeorm/entities/queues.typeorm-entity';
import { Service } from '../src/modules/services/data/typeorm/entities/services.typeorm-entity';
import { User } from '../src/modules/users/data/typeorm/entities/users.typeorm-entity';
import { OrganizationEntity } from '../src/modules/organizations/domain/entities/Organization.entity';
import { UserEntity } from '../src/modules/users/domain/entities/User.entity';
import { GroupRepository } from '../src/modules/groups/domain/repositories/GroupRepository';
import { OrganizationRepository } from '../src/modules/organizations/domain/repositories/OrganizationRepository';
import { QueueRepository } from '../src/modules/queues/domain/repositories/QueueRepository';
import { ServiceRepository } from '../src/modules/services/domain/repositories/ServiceRepository';
import { UserRepository } from '../src/modules/users/domain/repositories/UserRepository';
import { AuthenticationService } from '../src/modules/users/domain/services/AuthenticationService';
import { CommonModule } from '../src/modules/common/common.module';
import { OrganizationsModule } from '../src/modules/organizations/organizations.module';
import { UsersModule } from '../src/modules/users/users.module';
import * as request from 'supertest';
import { CreateUserRequest } from '../src/modules/users/presentation/http/dto/CreateUser';
import { INestApplication, Provider, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClientEntity } from '../src/modules/clients/domain/entities/Client.entity';
import { ClientRepository } from '../src/modules/clients/domain/repositories/ClientRepository';
import { ClientsModule } from '../src/modules/clients/clients.module';
import { Client } from '../src/modules/clients/data/typeorm/entities/clients.typeorm-entity';
import { AuthorizationService } from '../src/modules/users/domain/services/AuthorizationService';
import { EncryptionService } from '../src/modules/users/domain/services/EncryptionService';
import { OAuthService } from '../src/modules/users/domain/services/OauthAuthenticationService';
import { GroupEntity } from '../src/modules/groups/domain/entities/Group.entity';

// export const VALID_EMAIL = 'valid@email.com';

export function generateValidEmail() {
  return `${randomUUID()}@email.com`;
}
export const INVALID_EMAIL = 'invalidemail';

export const VALID_USER = {
  name: 'Valid Name',
  id: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
  email: 'valid@email.com',
  password: '12345678',
  userType: 'TYPE_COORDINATOR',
  createdAt: new Date(),
  updatedAt: new Date(),
  isSuperAdmin: false,
} as UserEntity;

export const VALID_ORGANIZATION = {
  id: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
  name: 'Valid Name',
  code: 'VAL',
} as OrganizationEntity;

export const VALID_CLIENT = {
  id: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
  name: 'Valid Name',
  createdAt: new Date(),
  updatedAt: new Date(),
  organizationId: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
  registrationId: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
} as ClientEntity;

export const VALID_GROUP = {
  id: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
  name: 'Valid Name',
  createdAt: new Date(),
  updatedAt: new Date(),
  organizationId: 'bc7e1f21-4f06-48ad-a9b4-f6bd0e6973b9',
} as GroupEntity;

export const ALL_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: UserRepository,
    useValue: {
      create: jest.fn(),
      findByEmail: jest.fn(),
      setUserRoleInOrganization: jest.fn(),
      findOneByIdOrAll: jest.fn(),
      findOneOrAllByIdAsAdmin: jest.fn(),
      findOneOrAllByIdAsUser: jest.fn(),
    } as UserRepository,
  },
  {
    provide: OrganizationRepository,
    useValue: {
      create: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findOneOrAllByIdAsAdmin: jest.fn(),
      findOneOrAllByIdAsUser: jest.fn(),
      checkIfUserIsFromOrganization: jest.fn(),
    } as OrganizationRepository,
  },
  {
    provide: ServiceRepository,
    useValue: {
      findByOrganizationId: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByDeskId: jest.fn(),
    } as ServiceRepository,
  },
  {
    provide: QueueRepository,
    useValue: {
      findByOrganizationId: jest.fn(),
      findByServiceId: jest.fn(),
      create: jest.fn(),
      findGroupsByQueueId: jest.fn(),
      attachGroupToQueue: jest.fn(),
      attachGroupsToQueue: jest.fn(),
      attachClientToQueue: jest.fn(),
      findById: jest.fn(),
      callNextClient: jest.fn(),
      getPositionOfClient: jest.fn(),
      attachServiceToQueue: jest.fn(),
      callClient: jest.fn(),
      attachClientToQueueByServiceIdOrganizationIdRegistrationId: jest.fn(),
    } as QueueRepository,
  },
  {
    provide: GroupRepository,
    useValue: {
      findByOrganizationId: jest.fn(),
      findGroupsByQueueId: jest.fn(),
      create: jest.fn(),
      attachClientsToGroup: jest.fn(),
      removeAllClientsFromGroup: jest.fn(),
    } as GroupRepository,
  },
  {
    provide: ClientRepository,
    useValue: {
      create: jest.fn(),
      findByRegistrationIdFromOrganization: jest.fn(),
      findOneOrAllByIdAsAdmin: jest.fn(),
      findOneOrAllByIdAsUser: jest.fn(),
      removeAsUser: jest.fn(),
      removeAsAdmin: jest.fn(),
      findManyIdsByRegistrationIds: jest.fn(),
      attachClientToQueue: jest.fn(),
      update: jest.fn(),
    } as ClientRepository,
  },
];

export const ALL_TYPEORM_ENTITIES = [
  Organization,
  Service,
  User,
  Queue,
  Group,
  Client,
];

export const TEST_CONFIG = [
  UsersModule,
  OrganizationsModule,
  ClientsModule,
  CommonModule,
  ConfigModule.forRoot({
    envFilePath: '.env.test',
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    migrations: ['src/modules/common/data/typeorm/migrations/*.ts'],
    migrationsRun: true,
    entities: ALL_TYPEORM_ENTITIES,
    logging: process.env.DATABASE_LOGGING === 'true',
  }),
];

export const ALL_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: EncryptionService,
    useValue: {
      check: jest.fn(),
      encrypt: jest.fn(),
    } as EncryptionService,
  },
  {
    provide: AuthenticationService,
    useValue: {
      generate: jest.fn(),
      decrypt: jest.fn(),
    } as AuthenticationService,
  },
  {
    provide: OAuthService,
    useValue: {
      getUserProfile: jest.fn(),
    } as OAuthService,
  },
  {
    provide: AuthorizationService,
    useValue: {
      checkIfUserHasRightsInOrganization: jest.fn(),
    } as AuthorizationService,
  },
];

export const UUID_V4_REGEX_EXPRESSION =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const JWT_TOKEN_REGEX_EXPRESSION = /^(?:[\w-]*\.){2}[\w-]*$/;

export function checkForTokenAndUserId(response: any) {
  if (response.isRight()) {
    expect(response.isRight()).toBeTruthy();
    expect(
      (response.value as { token: string; user: UserEntity }).token,
    ).toBeDefined();
    expect(
      (response.value as { token: string; user: UserEntity }).user.id,
    ).toBeDefined();
  } else {
    throw new Error();
  }
}

export async function generateUser(
  app,
): Promise<{ token: string; email: string; id: string }> {
  const { body } = await request(app.getHttpServer())
    .post('/v1/users')
    .send({
      name: VALID_USER.name,
      email: generateValidEmail(),
      password: VALID_USER.password,
    } as CreateUserRequest)
    .set('Accept', 'application/json')
    .expect(201);
  return {
    id: body.user.id,
    email: body.user.email,
    token: `bearer ${body.token}`,
  };
}

export async function generateTestingApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: TEST_CONFIG,
    providers: [],
  }).compile();

  const app = module.createNestApplication();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  return app;
}
