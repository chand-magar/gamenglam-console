import type { RootState } from '../../../app/store/index';

export const selectUsers          = (s: RootState) => s.users.items;
export const selectUserTotal      = (s: RootState) => s.users.total;
export const selectUserPage       = (s: RootState) => s.users.page;
export const selectUserLimit      = (s: RootState) => s.users.limit;
export const selectUserPages      = (s: RootState) => s.users.totalPages;
export const selectUserLoading    = (s: RootState) => s.users.isLoading;
export const selectUserSubmitting = (s: RootState) => s.users.isSubmitting;
export const selectUserError      = (s: RootState) => s.users.error;