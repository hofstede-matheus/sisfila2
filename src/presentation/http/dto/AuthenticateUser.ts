export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  token: string;
}
