import { ApiProperty } from '@nestjs/swagger';
import { DeskWithoutServicesAndAttendant } from '../../../../common/presentation/http/dto/_shared';

export class GetClientPositionInQueueResponse {
  @ApiProperty({ example: 1 })
  position: number;

  // desk
  @ApiProperty({
    type: DeskWithoutServicesAndAttendant,
  })
  desk?: DeskWithoutServicesAndAttendant;
}
