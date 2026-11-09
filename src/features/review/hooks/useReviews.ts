import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { fetchReviewsThunk, deleteReviewThunk, clearError, setPage } from '../store/reviewSlice';
import {
  selectReviews, selectReviewTotal, selectReviewPage, selectReviewLimit,
  selectReviewPages, selectReviewLoading, selectReviewSubmitting, selectReviewError,
} from '../store/reviewSelectors';
import type { ReviewFilters } from '../../../domain/repositories/IReviewRepository';

export const useReviews = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectReviews);
  const total        = useAppSelector(selectReviewTotal);
  const page         = useAppSelector(selectReviewPage);
  const limit        = useAppSelector(selectReviewLimit);
  const totalPages   = useAppSelector(selectReviewPages);
  const isLoading    = useAppSelector(selectReviewLoading);
  const isSubmitting = useAppSelector(selectReviewSubmitting);
  const error        = useAppSelector(selectReviewError);

  const fetch = useCallback(
    (filters: ReviewFilters = {}) => dispatch(fetchReviewsThunk(filters)),
    [dispatch],
  );
  const remove = useCallback(
    (id: string) => dispatch(deleteReviewThunk(id)),
    [dispatch],
  );
  const changePage = useCallback(
    (p: number) => { dispatch(setPage(p)); dispatch(fetchReviewsThunk({ page: p, limit })); },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, remove, changePage,
    dismissError: () => dispatch(clearError()),
  };
};
