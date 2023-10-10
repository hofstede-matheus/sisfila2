import { ApiProperty } from '@nestjs/swagger';
import { UserEntityTypes } from '../../../../users/domain/entities/User.entity';
import exp from 'constants';

export class RolesInOrganizations {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  readonly organizationId: string;
  @ApiProperty({
    example: 'TYPE_COORDINATOR',
  })
  readonly role: UserEntityTypes;
}

export class User {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'example@email.com',
  })
  email: string;

  @ApiProperty({ type: [RolesInOrganizations] })
  rolesInOrganizations: RolesInOrganizations[];

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;
}

export class Client {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  organizationId: string;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  registrationId: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  calledDate?: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  attendedByUserId?: string;
}

export class ClientInGroup {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  organizationId: string;

  @ApiProperty({
    example: '12345678',
  })
  registrationId: string;
}

export class Organization {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'ORG',
  })
  code: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'TYPE_COORDINATOR',
  })
  userRoleInOrganization?: UserEntityTypes;
}

export class Group {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  organizationId: string;

  @ApiProperty({ type: [ClientInGroup] })
  clients?: ClientInGroup[];
}

export class Queue {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'ABCDEF',
  })
  description: string;

  @ApiProperty({
    example: 'ABCD',
  })
  code: string;

  @ApiProperty({
    example: 10,
  })
  priority: number;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  organizationId: string;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  serviceId: string;

  @ApiProperty({
    type: [Client],
  })
  clients: Client[];

  @ApiProperty({
    type: Client,
  })
  lastClientCalled: Client;

  @ApiProperty({
    type: [Group],
  })
  groups: Group[];
}

export class Service {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'ABCDEF',
  })
  subscriptionToken: string;

  @ApiProperty({
    example: true,
  })
  guestEnroll: boolean;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  opensAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  closesAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  organizationId: string;

  @ApiProperty({
    example: true,
  })
  isOpened: boolean;

  @ApiProperty({ type: [Queue] })
  queues?: Queue[];
}

export class OrganizationWithServices {
  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'ORG',
  })
  code: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'TYPE_COORDINATOR',
  })
  userRoleInOrganization?: UserEntityTypes;

  // services
  @ApiProperty({
    type: [Service],
  })
  services: Service[];
}

export class Desk {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Desk 1',
  })
  name: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  attendantId: string;

  @ApiProperty({
    type: [Service],
  })
  services: Service[];

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;
}

export class DeskWithoutServicesAndAttendant {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Desk 1',
  })
  name: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2022-12-19T23:03:44.662Z',
  })
  updatedAt: Date;
}
