import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequest {
  @ApiProperty({
    example: 'Service name',
  })
  name: string;

  @ApiProperty({
    example: 'token',
  })
  subscriptionToken: string;

  @ApiProperty({
    example: true,
  })
  guestEnrollment: boolean;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
  })
  opensAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
  })
  closesAt: Date;
}

export class CreateServiceResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;
}
