import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../common/presentation/http/dto/_shared';

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
  opensAt: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
  })
  closesAt: string;
}

export class CreateServiceResponse extends Service {}
