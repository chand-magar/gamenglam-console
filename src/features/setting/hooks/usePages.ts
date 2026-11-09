import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchPagesThunk, createPageThunk,
  updatePageThunk, deletePageThunk,
  clearPageError, setPagePage,
} from '../store/pageSlice';
import {
  selectPages, selectPageTotal, selectPagePage,
  selectPageLimit, selectPagePages,
  selectPageLoading, selectPageSubmitting, selectPageError,
} from '../store/pageSelectors';
import type {
  PageFilters, CreatePagePayload, UpdatePagePayload,
} from '../../../domain/repositories/IPageRepository';

export const usePages = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectPages);
  const total        = useAppSelector(selectPageTotal);
  const page         = useAppSelector(selectPagePage);
  const limit        = useAppSelector(selectPageLimit);
  const totalPages   = useAppSelector(selectPagePages);
  const isLoading    = useAppSelector(selectPageLoading);
  const isSubmitting = useAppSelector(selectPageSubmitting);
  const error        = useAppSelector(selectPageError);

  const fetch = useCallback(
    (filters: PageFilters = {}) => dispatch(fetchPagesThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreatePagePayload) => dispatch(createPageThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdatePagePayload) =>
      dispatch(updatePageThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deletePageThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setPagePage(p));
      dispatch(fetchPagesThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearPageError()),
  };
};