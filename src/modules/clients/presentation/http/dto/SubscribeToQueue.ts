import { ApiProperty } from '@nestjs/swagger';

export class SubscribeToQueueRequest {
  @ApiProperty({
    example: 'FCM_TOKEN',
  })
  token: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  queueId: string;
}
