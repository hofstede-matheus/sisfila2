import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationRequest {
  @ApiProperty({
    example: 'Organization Name',
  })
  name: string;

  @ApiProperty({
    example: 'ORG',
  })
  code: string;
}

export class CreateOrganizationResponse {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;
}
