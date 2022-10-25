export interface OAuthAuthenticationService {
  getUserProfile(
    token: string,
    audience: string,
  ): Promise<OAuthUserProfile | undefined>;
}

export interface OAuthUserProfile {
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

export const OAuthAuthenticationService = Symbol('OAuthAuthenticationService');
