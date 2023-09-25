import { ApiProperty } from '@nestjs/swagger';
import { Client, Desk } from '../../../../common/presentation/http/dto/_shared';

export class CallNextOnDeskRequest {
  @ApiProperty({
    example: 'valid_uuid',
  })
  deskId: string;
}

export class CallNextOnDeskResponse {
  @ApiProperty({
    type: Desk,
  })
  desk: Desk;

  @ApiProperty({
    type: Client,
  })
  client: Client;
}
