import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateWithGoogleRequest {
  @ApiProperty({
    example: 'valid_oauth_token',
  })
  oauthToken: string;

  @ApiProperty({
    example: 'valid_audience',
  })
  audience: string;
}

export class AuthenticateWithGoogleResponse {
  @ApiProperty({
    example: 'valid_token',
  })
  token: string;
}
