import type { RootState } from '../../../app/store/index';

export const selectAttributes          = (s: RootState) => s.attributes.items;
export const selectAttributeTotal      = (s: RootState) => s.attributes.total;
export const selectAttributePage       = (s: RootState) => s.attributes.page;
export const selectAttributeLimit      = (s: RootState) => s.attributes.limit;
export const selectAttributePages      = (s: RootState) => s.attributes.totalPages;
export const selectAttributeLoading    = (s: RootState) => s.attributes.isLoading;
export const selectAttributeSubmitting = (s: RootState) => s.attributes.isSubmitting;
export const selectAttributeError      = (s: RootState) => s.attributes.error;