import type { RootState } from '../../../app/store/index';

export const selectProducts          = (s: RootState) => s.products.items;
export const selectProductTotal      = (s: RootState) => s.products.total;
export const selectProductPage       = (s: RootState) => s.products.page;
export const selectProductLimit      = (s: RootState) => s.products.limit;
export const selectProductPages      = (s: RootState) => s.products.totalPages;
export const selectProductLoading    = (s: RootState) => s.products.isLoading;
export const selectProductSubmitting = (s: RootState) => s.products.isSubmitting;
export const selectProductError      = (s: RootState) => s.products.error;

export const selectVariants          = (s: RootState) => s.productVariants.items;
export const selectVariantLoading    = (s: RootState) => s.productVariants.isLoading;
export const selectVariantSubmitting = (s: RootState) => s.productVariants.isSubmitting;
export const selectVariantError      = (s: RootState) => s.productVariants.error;