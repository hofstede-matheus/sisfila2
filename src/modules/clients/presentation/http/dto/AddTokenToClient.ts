import { ApiProperty } from '@nestjs/swagger';

export class AddTokenToClientRequest {
  @ApiProperty({
    example: 'FCM_TOKEN',
  })
  token: string;
}
