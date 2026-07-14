import type { RootState } from '../../../app/store/index';

export const selectCategories     = (s: RootState) => s.categories.items;
export const selectCategoryTotal  = (s: RootState) => s.categories.total;
export const selectCategoryPage   = (s: RootState) => s.categories.page;
export const selectCategoryLimit  = (s: RootState) => s.categories.limit;
export const selectCategoryPages  = (s: RootState) => s.categories.totalPages;
export const selectCategoryLoading= (s: RootState) => s.categories.isLoading;
export const selectCategorySubmitting = (s: RootState) => s.categories.isSubmitting;
export const selectCategoryError  = (s: RootState) => s.categories.error;