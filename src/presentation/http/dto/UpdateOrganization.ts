import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationRequest {
  @ApiProperty({
    example: 'valid_uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Organization Name',
  })
  name: string;

  @ApiProperty({
    example: 'ORG',
  })
  code: string;
}
