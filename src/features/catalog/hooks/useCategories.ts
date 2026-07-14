import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchCategoriesThunk,
  createCategoryThunk,
  updateCategoryThunk,
  deleteCategoryThunk,
  clearError,
  setPage,
} from '../store/categorySlice';
import {
  selectCategories,
  selectCategoryTotal,
  selectCategoryPage,
  selectCategoryLimit,
  selectCategoryPages,
  selectCategoryLoading,
  selectCategorySubmitting,
  selectCategoryError,
} from '../store/categorySelectors';
import type {
  CategoryFilters,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../../domain/repositories/ICategoryRepository';

export const useCategories = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectCategories);
  const total        = useAppSelector(selectCategoryTotal);
  const page         = useAppSelector(selectCategoryPage);
  const limit        = useAppSelector(selectCategoryLimit);
  const totalPages   = useAppSelector(selectCategoryPages);
  const isLoading    = useAppSelector(selectCategoryLoading);
  const isSubmitting = useAppSelector(selectCategorySubmitting);
  const error        = useAppSelector(selectCategoryError);

  const fetch = useCallback(
    (filters: CategoryFilters = {}) =>
      dispatch(fetchCategoriesThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreateCategoryPayload) =>
      dispatch(createCategoryThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: number, payload: UpdateCategoryPayload) =>
      dispatch(updateCategoryThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: number) => dispatch(deleteCategoryThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setPage(p));
      dispatch(fetchCategoriesThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearError()),
  };
};