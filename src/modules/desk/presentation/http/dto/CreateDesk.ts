import { ApiProperty } from '@nestjs/swagger';
import { Desk } from '../../../../common/presentation/http/dto/_shared';

export class CreateDeskRequest {
  @ApiProperty({
    example: 'Desk 1',
  })
  name: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;
}

export class CreateDeskResponse extends Desk {}
