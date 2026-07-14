import axiosInstance from '../../core/api/axiosInstance';
import type {
  IAuthRepository,
  LoginPayload,
  AuthResult,
  AuthTokens,
} from '../../domain/repositories/IAuthRepository';
import type { User } from '../../domain/entities/User';
import type { ApiResponse } from '../../core/types/common.types';

export class AuthRepository implements IAuthRepository {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResult>>('/auth/login', payload);
    return data.data;
  }

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  }

  async forgotPassword(username: string): Promise<void> {
    await axiosInstance.post('/auth/forgot-password', { username });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/reset-password', { token, newPassword });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/auth/change-password', { oldPassword, newPassword });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await axiosInstance.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data.data;
  }

  async me(): Promise<User> {
    const { data } = await axiosInstance.get<ApiResponse<User>>('/auth/me');
    return data.data;
  }
}