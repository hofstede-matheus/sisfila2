import { ApiProperty } from '@nestjs/swagger';

export class EnterQueueRequest {
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
  queueId: string;
}
