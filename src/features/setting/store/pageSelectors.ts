import type { RootState } from '../../../app/store/index';

export const selectPages          = (s: RootState) => s.pages.items;
export const selectPageTotal      = (s: RootState) => s.pages.total;
export const selectPagePage       = (s: RootState) => s.pages.page;
export const selectPageLimit      = (s: RootState) => s.pages.limit;
export const selectPagePages      = (s: RootState) => s.pages.totalPages;
export const selectPageLoading    = (s: RootState) => s.pages.isLoading;
export const selectPageSubmitting = (s: RootState) => s.pages.isSubmitting;
export const selectPageError      = (s: RootState) => s.pages.error;