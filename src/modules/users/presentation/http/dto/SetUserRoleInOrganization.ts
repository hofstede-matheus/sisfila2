import { ApiProperty } from '@nestjs/swagger';
import { UserEntityTypes } from '../../../domain/entities/User.entity';

export class SetUserRoleInOrganizationRequest {
  @ApiProperty({
    enum: UserEntityTypes,
    examples: [
      UserEntityTypes.TYPE_ATTENDENT,
      UserEntityTypes.TYPE_COORDINATOR,
    ],
  })
  role: UserEntityTypes;
}
