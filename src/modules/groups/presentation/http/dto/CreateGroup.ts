import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../../../../common/presentation/http/dto/_shared';

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

export class CreateGroupResponse extends Group {}
