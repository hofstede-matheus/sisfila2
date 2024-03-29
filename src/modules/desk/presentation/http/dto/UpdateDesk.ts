import { ApiProperty } from '@nestjs/swagger';
import { Desk } from '../../../../common/presentation/http/dto/_shared';

export class UpdateDeskRequest {
  @ApiProperty({
    example: 'Desk 1',
  })
  name: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  attendantId: string;

  @ApiProperty({
    type: [String],
    example: ['valid_uuid', 'valid_uuid'],
  })
  services: string[];
}

export class UpdateDeskResponse extends Desk {}
