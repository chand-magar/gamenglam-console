import type { RootState } from '../../../app/store/index';

export const selectReviews          = (s: RootState) => s.reviews.items;
export const selectReviewTotal      = (s: RootState) => s.reviews.total;
export const selectReviewPage       = (s: RootState) => s.reviews.page;
export const selectReviewLimit      = (s: RootState) => s.reviews.limit;
export const selectReviewPages      = (s: RootState) => s.reviews.totalPages;
export const selectReviewLoading    = (s: RootState) => s.reviews.isLoading;
export const selectReviewSubmitting = (s: RootState) => s.reviews.isSubmitting;
export const selectReviewError      = (s: RootState) => s.reviews.error;
