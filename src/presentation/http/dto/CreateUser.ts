import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    example: 'TYPE_COORDINATOR',
  })
  userType: string;
}

export class CreateUserResponse {
  @ApiProperty({
    example: 'valid_token',
  })
  token: string;
}
