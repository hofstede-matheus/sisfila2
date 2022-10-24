import {
  OauthAuthenticationService,
  OauthUserProfile,
} from '../../domain/services/OAuthAuthenticationService';

import { OAuth2Client } from 'google-auth-library';

export class GoogleOauthAuthenticationService
  implements OauthAuthenticationService
{
  private client: OAuth2Client;
  constructor() {
    this.client = new OAuth2Client(
      '1097277391121-m941rehh4v7jit0s0clvbnhr5gm2ue5c.apps.googleusercontent.com',
    );
  }

  async getUserProfile(
    token: string,
    audience: string,
  ): Promise<OauthUserProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience,
    });

    const {
      email,
      email_verified,
      family_name,
      given_name,
      hd,
      locale,
      name,
      picture,
      sub,
    } = ticket.getPayload();

    return {
      email,
      email_verified,
      family_name,
      given_name,
      hd,
      locale,
      name,
      picture,
      sub,
    };
  }
}
