import type {
  IAuthRepository,
  LoginPayload,
  AuthResult,
} from '../repositories/IAuthRepository';
import type { User } from '../entities/User';
import { tokenService } from '../../core/utils/token';

export class AuthUseCases {
  constructor(private readonly authRepo: IAuthRepository) {}

  async login(payload: LoginPayload): Promise<AuthResult> {
    const result = await this.authRepo.login(payload);
    tokenService.setTokens(result.access_token, result.refresh_token);
    tokenService.setUser(result.user);
    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.authRepo.logout();
    } finally {
      // Always clear local storage regardless of API response
      tokenService.clearTokens();
    }
  }

  // Called when API logout fails — clears local state only
  clearLocalSession(): void {
    tokenService.clearTokens();
  }

  async forgotPassword(username: string): Promise<void> {
    return this.authRepo.forgotPassword(username);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.authRepo.resetPassword(token, newPassword);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.authRepo.changePassword(oldPassword, newPassword);
  }

  async getProfile(): Promise<User> {
    const user = tokenService.getUser();
    if (!user) throw new Error('No user session found');
    return user;
  }
}