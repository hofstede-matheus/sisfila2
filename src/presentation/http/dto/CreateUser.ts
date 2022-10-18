export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  userType: string;
}

export interface CreateUserResponse {
  token: string;
}
