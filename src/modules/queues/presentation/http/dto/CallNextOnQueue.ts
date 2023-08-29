import { ApiProperty } from '@nestjs/swagger';

export class CallNextOnQueueRequest {
  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  queueId: string;
}
