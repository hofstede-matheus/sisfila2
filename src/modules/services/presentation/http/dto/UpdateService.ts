import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../common/presentation/http/dto/_shared';

export class UpdateServiceRequest {
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
    example: '2021-01-01T00:00:00.000Z',
  })
  opensAt: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
  })
  closesAt: string;

  @ApiProperty({
    example: ['queueId1', 'queueId2'],
  })
  queueIds: string[];
}

export class UpdateServiceResponse extends Service {}
