import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupRequest {
  @ApiProperty({
    example: 'Group name',
  })
  name: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;
}

export class CreateGroupResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;
}
