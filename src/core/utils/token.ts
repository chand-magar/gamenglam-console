import { storage } from './storage';
import type { User } from '../../domain/entities/User';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

export const tokenService = {
  getAccessToken: () => storage.get<string>(ACCESS_KEY),
  getRefreshToken: () => storage.get<string>(REFRESH_KEY),

  setTokens: (access: string, refresh: string) => {
    storage.set(ACCESS_KEY, access);
    storage.set(REFRESH_KEY, refresh);
  },

  clearTokens: () => {
    storage.remove(ACCESS_KEY);
    storage.remove(REFRESH_KEY);
    storage.remove(USER_KEY);
  },

  // Store full user object after login
  setUser: (user: User) => {
    storage.set(USER_KEY, user);
  },

  // Retrieve stored user
  getUser: (): User | null => {
    return storage.get<User>(USER_KEY);
  },
};