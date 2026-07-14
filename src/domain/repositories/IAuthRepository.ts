import type { User } from '../entities/User';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResult {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface IAuthRepository {
  login(payload: LoginPayload): Promise<AuthResult>;
  logout(): Promise<void>;
  forgotPassword(username: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  me(): Promise<User>;
}