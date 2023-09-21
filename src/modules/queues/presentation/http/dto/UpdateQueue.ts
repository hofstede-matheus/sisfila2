import { ApiProperty } from '@nestjs/swagger';
import { Queue } from '../../../../common/presentation/http/dto/_shared';

export class UpdateQueueRequest {
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'ABCDEF',
  })
  description: string;

  @ApiProperty({
    example: 'ABCD',
  })
  code: string;

  @ApiProperty({
    example: 10,
  })
  priority: number;

  @ApiProperty({ example: ['valid_uuid', 'valid_uuid'] })
  groups: string[];

  @ApiProperty({ example: 'valid_uuid' })
  serviceId: string;
}

export class UpdateQueueResponse extends Queue {}
