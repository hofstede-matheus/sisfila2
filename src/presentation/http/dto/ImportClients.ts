import { ApiProperty } from '@nestjs/swagger';
import { Client } from './_shared';

export class importClientsRequest {
  @ApiProperty({
    example: 'John Doe',
  })
  clients: Client[];

  @ApiProperty({
    example: 'valid_uuid',
  })
  groupId: string;
}
