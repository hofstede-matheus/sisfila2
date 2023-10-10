import { ApiProperty } from '@nestjs/swagger';
import { Client, Desk } from '../../../../common/presentation/http/dto/_shared';

export class GetDeskResponse {
  @ApiProperty({
    type: Desk,
  })
  desk: Desk;

  @ApiProperty({
    type: Client,
  })
  lastCalledClient: Client;
}
