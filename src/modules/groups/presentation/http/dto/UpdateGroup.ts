import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../../../../common/presentation/http/dto/_shared';

export class UpdateGroupRequest {
  @ApiProperty({
    example: 'Group name',
  })
  name: string;
}

export class UpdateGroupResponse extends Group {}
