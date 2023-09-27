export interface AuthenticationService {
  generate(id: string): string;
  decrypt(token: string): AuthPayload;
}

export interface AuthPayload {
  sub: string;
}

export const AuthenticationService = Symbol('AuthenticationService');
