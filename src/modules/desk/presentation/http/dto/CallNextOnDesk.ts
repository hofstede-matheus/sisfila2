import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../../../../common/presentation/http/dto/_shared';

export class CallNextOnDeskRequest {
  @ApiProperty({
    example: 'valid_uuid',
  })
  deskId: string;
}

export class CallNextOnDeskResponse extends Client {}
