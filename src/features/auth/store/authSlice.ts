import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AuthRepository } from '../../../infrastructure/repositories/AuthRepository';
import { AuthUseCases } from '../../../domain/usecases/AuthUseCases';
import type { AuthState } from '../types/auth.types';
import type { User } from '../../../domain/entities/User';
import type { LoginPayload } from '../../../domain/repositories/IAuthRepository';

const authUseCases = new AuthUseCases(new AuthRepository());

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await authUseCases.login(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return rejectWithValue(msg);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authUseCases.logout();
    } catch {
      // Even if API call fails, clear local session
      authUseCases.clearLocalSession();
    }
  },
);

export const fetchMeThunk = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      return await authUseCases.getProfile();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Session expired');
    }
  },
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (username: string, { rejectWithValue }) => {
    try {
      await authUseCases.forgotPassword(username);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Request failed');
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await authUseCases.resetPassword(token, newPassword);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Reset failed');
    }
  },
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload as string;
      })

      // Logout — always reset state regardless of API success/fail
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        // Still clear state even if API failed
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })

      // Me
      .addCase(fetchMeThunk.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;