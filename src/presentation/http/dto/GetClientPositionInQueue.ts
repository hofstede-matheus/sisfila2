import { ApiProperty } from '@nestjs/swagger';

export class GetClientPositionInQueueResponse {
  @ApiProperty({ example: 1 })
  position: number;
}
