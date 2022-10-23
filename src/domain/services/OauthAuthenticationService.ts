export interface OauthAuthenticationService {
  getUserProfile(
    token: string,
    audience: string,
  ): Promise<OauthUserProfile | undefined>;
}

export interface OauthUserProfile {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  hd: string;
  locale: string;
  name: string;
  picture: string;
  sub: string;
}

export const OauthAuthenticationService = Symbol('OauthAuthenticationService');
