import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  loginThunk,
  logoutThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  clearError,
} from '../store/authSlice';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../store/authSelectors';
import type { LoginPayload } from '../../../domain/repositories/IAuthRepository';
import { ROLE_PERMISSIONS } from '../../../core/constants/permissions';
import type { Permission } from '../../../core/constants/permissions';

export const useAuth = () => {
  const dispatch        = useAppDispatch();
  const user            = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading       = useAppSelector(selectAuthLoading);
  const error           = useAppSelector(selectAuthError);

  const login = useCallback(
    (payload: LoginPayload) => dispatch(loginThunk(payload)),
    [dispatch],
  );

  const logout = useCallback(
    () => dispatch(logoutThunk()),
    [dispatch],
  );

  const forgotPassword = useCallback(
    (username: string) => dispatch(forgotPasswordThunk(username)),
    [dispatch],
  );

  const resetPassword = useCallback(
    (token: string, newPassword: string) =>
      dispatch(resetPasswordThunk({ token, newPassword })),
    [dispatch],
  );

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
    },
    [user],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    forgotPassword,
    resetPassword,
    hasPermission,
    dismissError: () => dispatch(clearError()),
  };
};