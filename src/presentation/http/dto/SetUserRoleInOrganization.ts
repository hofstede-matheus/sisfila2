import { ApiProperty } from '@nestjs/swagger';

export class SetUserRoleInOrganizationRequest {
  @ApiProperty({
    examples: ['TYPE_COORDINATOR', 'TYPE_ATTENDENT', undefined],
  })
  role: string | undefined;
}
