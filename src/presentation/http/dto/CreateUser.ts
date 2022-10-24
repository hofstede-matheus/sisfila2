import { ApiProperty } from '@nestjs/swagger';
import { User } from './shared';

export class CreateUserRequest {
  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'example@email.com',
  })
  email: string;

  @ApiProperty({
    example: '12345678',
  })
  password: string;
}

export class CreateUserResponse {
  @ApiProperty({
    example: 'valid_token',
  })
  token: string;

  @ApiProperty({ type: User })
  user: User;
}
