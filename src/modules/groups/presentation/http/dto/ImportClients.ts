import { ApiProperty } from '@nestjs/swagger';

export class ClientToImport {
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: '04859541847',
  })
  registrationId: string;
}

export class ImportClientsRequest {
  @ApiProperty({ type: [ClientToImport] })
  clients: ClientToImport[];

  @ApiProperty({ example: 'valid_uuid' })
  groupId: string;

  @ApiProperty({ example: 'valid_uuid' })
  organizationId: string;
}
