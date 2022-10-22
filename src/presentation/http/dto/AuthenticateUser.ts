import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateUserRequest {
  @ApiProperty({
    example: 'example@email.com',
  })
  email: string;
  @ApiProperty({
    example: '12345678',
  })
  password: string;
}

export class AuthenticateUserResponse {
  @ApiProperty({
    example: 'valid_token',
  })
  token: string;
}
