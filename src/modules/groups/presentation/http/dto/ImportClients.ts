import { ApiProperty } from '@nestjs/swagger';
import { CreateClientRequest } from '../../../../clients/presentation/http/dto/CreateClient';
import { Client } from '../../../../common/presentation/http/dto/_shared';

export class ImportClientsRequest {
  @ApiProperty({ type: [CreateClientRequest] })
  clients: Client[];

  @ApiProperty({ example: 'valid_uuid' })
  groupId: string;

  @ApiProperty({ example: 'valid_uuid' })
  organizationId: string;
}
