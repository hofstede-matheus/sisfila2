import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ type: [Client] })
  clients?: Client[];
}
