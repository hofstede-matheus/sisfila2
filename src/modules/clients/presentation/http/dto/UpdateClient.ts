import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../../../../common/presentation/http/dto/_shared';

export class UpdateClientRequest {
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;
}

export class UpdateClientResponse extends Client {}
