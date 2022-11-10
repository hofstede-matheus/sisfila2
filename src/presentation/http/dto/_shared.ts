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
    example: [
      {
        organizationName: 'name',
        organizationId: '73be6348-a46d-4371-8a28-70988f39f7b7',
        role: 'TYPE_COORDINATOR',
      },
    ],
  })
  userRolesOnOrganizationsMap: {
    organizationName: string;
    organizationId: string;
    role: string;
  }[];

  @ApiProperty({
    example: 'Date',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'Date',
  })
  updatedAt: Date;
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
