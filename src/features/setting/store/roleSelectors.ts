import type { RootState } from '../../../app/store/index';

export const selectRoles          = (s: RootState) => s.roles.items;
export const selectRoleTotal      = (s: RootState) => s.roles.total;
export const selectRolePage       = (s: RootState) => s.roles.page;
export const selectRoleLimit      = (s: RootState) => s.roles.limit;
export const selectRolePages      = (s: RootState) => s.roles.totalPages;
export const selectRoleLoading    = (s: RootState) => s.roles.isLoading;
export const selectRoleSubmitting = (s: RootState) => s.roles.isSubmitting;
export const selectRoleError      = (s: RootState) => s.roles.error;