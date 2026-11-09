import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchCouponsThunk, createCouponThunk, updateCouponThunk, deleteCouponThunk,
  clearError, setPage,
} from '../store/couponSlice';
import {
  selectCoupons, selectCouponTotal, selectCouponPage, selectCouponLimit,
  selectCouponPages, selectCouponLoading, selectCouponSubmitting, selectCouponError,
} from '../store/couponSelectors';
import type { CouponFilters, CreateCouponPayload, UpdateCouponPayload } from '../../../domain/repositories/ICouponRepository';

export const useCoupons = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectCoupons);
  const total        = useAppSelector(selectCouponTotal);
  const page         = useAppSelector(selectCouponPage);
  const limit        = useAppSelector(selectCouponLimit);
  const totalPages   = useAppSelector(selectCouponPages);
  const isLoading    = useAppSelector(selectCouponLoading);
  const isSubmitting = useAppSelector(selectCouponSubmitting);
  const error        = useAppSelector(selectCouponError);

  const fetch = useCallback(
    (filters: CouponFilters = {}) => dispatch(fetchCouponsThunk(filters)),
    [dispatch],
  );
  const create = useCallback(
    (payload: CreateCouponPayload) => dispatch(createCouponThunk(payload)),
    [dispatch],
  );
  const update = useCallback(
    (id: string, payload: UpdateCouponPayload) => dispatch(updateCouponThunk({ id, payload })),
    [dispatch],
  );
  const remove = useCallback(
    (id: string) => dispatch(deleteCouponThunk(id)),
    [dispatch],
  );
  const changePage = useCallback(
    (p: number) => { dispatch(setPage(p)); dispatch(fetchCouponsThunk({ page: p, limit })); },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearError()),
  };
};
