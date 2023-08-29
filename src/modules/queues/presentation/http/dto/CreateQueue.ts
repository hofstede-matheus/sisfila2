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
    example: 1,
  })
  priority: number;

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
}

export class CreateQueueResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;
}
