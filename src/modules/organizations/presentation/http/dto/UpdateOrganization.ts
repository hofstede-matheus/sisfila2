import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../../../../common/presentation/http/dto/_shared';

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

export class UpdateOrganizationResponse extends Organization {}
