import { ApiProperty } from '@nestjs/swagger';

export class CreateQueueRequest {
  @ApiProperty({
    example: 'Queue name',
  })
  name: string;

  @ApiProperty({
    example: 'description',
  })
  description: string;

  @ApiProperty({
    example: 'code',
  })
  code: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  serviceId: string;

  @ApiProperty({
    example: ['valid_uuid'],
  })
  groupIds: string[];
}
