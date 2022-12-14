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
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
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
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
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
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
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
    example: 'Date',
  })
  opensAt: Date;

  @ApiProperty({
    example: 'Date',
  })
  closesAt: Date;

  @ApiProperty({
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
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
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
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
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '73be6348-a46d-4371-8a28-70988f39f7b7',
  })
  organizationId: string;

  @ApiProperty({ type: [Client] })
  clients?: Client[];
}
