import { ApiProperty } from '@nestjs/swagger';

export class SetUserRoleInOrganizationRequest {
  @ApiProperty({
    example: 'TYPE_COORDINATOR',
  })
  role: string;
}
