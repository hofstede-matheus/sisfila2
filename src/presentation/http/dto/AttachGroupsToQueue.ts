import { ApiProperty } from '@nestjs/swagger';

export class AttachGroupsToQueueRequest {
  @ApiProperty({ example: ['valid_uuid', 'valid_uuid'] })
  groups: string[];
}
