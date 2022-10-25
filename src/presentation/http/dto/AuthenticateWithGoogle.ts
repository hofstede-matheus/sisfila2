import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateWithGoogleRequest {
  @ApiProperty({
    example: 'valid_oauth_token',
  })
  idToken: string;

  @ApiProperty({
    example: 'valid_audience',
  })
  audience: string;
}
