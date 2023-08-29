import { ApiProperty } from '@nestjs/swagger';

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

export class CreateClientResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;
}
