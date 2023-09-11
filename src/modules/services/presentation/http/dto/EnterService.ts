import { ApiProperty } from '@nestjs/swagger';

export class EnterServiceRequest {
  @ApiProperty({
    example: '04859541847',
  })
  registrationId: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  serviceId: string;
}

export class EnterServiceResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  queueId: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  queueName: string;

  @ApiProperty({
    example: 1,
  })
  position: number;
}
