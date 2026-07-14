import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchVariantsThunk, createVariantThunk,
  updateVariantThunk, deleteVariantThunk, clearVariantError,
} from '../store/productVariantSlice';
import {
  selectVariants, selectVariantLoading,
  selectVariantSubmitting, selectVariantError,
} from '../store/productSelectors';
import type {
  CreateVariantPayload, UpdateVariantPayload,
} from '../../../domain/repositories/IProductRepository';

export const useProductVariants = (productId: string) => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectVariants);
  const isLoading    = useAppSelector(selectVariantLoading);
  const isSubmitting = useAppSelector(selectVariantSubmitting);
  const error        = useAppSelector(selectVariantError);

  const fetch = useCallback(
    () => dispatch(fetchVariantsThunk(productId)),
    [dispatch, productId],
  );

  const create = useCallback(
    (payload: CreateVariantPayload) => dispatch(createVariantThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdateVariantPayload) =>
      dispatch(updateVariantThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteVariantThunk(id)),
    [dispatch],
  );

  return {
    items, isLoading, isSubmitting, error,
    fetch, create, update, remove,
    dismissError: () => dispatch(clearVariantError()),
  };
};