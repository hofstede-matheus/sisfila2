import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../../../../common/presentation/http/dto/_shared';

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

export class CreateOrganizationResponse extends Organization {}
