import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationRequest {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Organization Name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'ORG',
    required: false,
  })
  code?: string;
}
