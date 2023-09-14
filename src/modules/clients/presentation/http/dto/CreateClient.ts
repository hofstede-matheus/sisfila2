import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../../../../common/presentation/http/dto/_shared';

export class CreateClientRequest {
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'valid_uuid',
  })
  organizationId: string;

  @ApiProperty({
    example: '04859541847',
  })
  registrationId: string;
}

export class CreateClientResponse extends Client {}
