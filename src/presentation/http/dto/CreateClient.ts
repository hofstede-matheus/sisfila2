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
    example: 'valid_uuid',
  })
  registrationId: string;
}

export class CreateClientResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;
}
