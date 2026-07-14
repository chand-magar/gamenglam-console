import type { RootState } from '../../../app/store/index';

export const selectSections          = (s: RootState) => s.sections.items;
export const selectSectionTotal      = (s: RootState) => s.sections.total;
export const selectSectionPage       = (s: RootState) => s.sections.page;
export const selectSectionLimit      = (s: RootState) => s.sections.limit;
export const selectSectionPages      = (s: RootState) => s.sections.totalPages;
export const selectSectionLoading    = (s: RootState) => s.sections.isLoading;
export const selectSectionSubmitting = (s: RootState) => s.sections.isSubmitting;
export const selectSectionError      = (s: RootState) => s.sections.error;