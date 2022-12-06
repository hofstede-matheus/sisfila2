import { ApiProperty } from '@nestjs/swagger';
import { CreateClientRequest } from './CreateClient';
import { Client } from './_shared';

export class ImportClientsRequest {
  @ApiProperty({ type: [CreateClientRequest] })
  clients: Client[];

  @ApiProperty({ example: 'valid_uuid' })
  groupId: string;
}
