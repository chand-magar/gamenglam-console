import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchAttributesThunk,
  createAttributeThunk,
  updateAttributeThunk,
  deleteAttributeThunk,
  clearAttributeError,
  setAttributePage,
} from '../store/attributeSlice';
import {
  selectAttributes,
  selectAttributeTotal,
  selectAttributePage,
  selectAttributeLimit,
  selectAttributePages,
  selectAttributeLoading,
  selectAttributeSubmitting,
  selectAttributeError,
} from '../store/attributeSelectors';
import type {
  AttributeFilters,
  CreateAttributePayload,
  UpdateAttributePayload,
} from '../../../domain/repositories/IAttributeRepository';

export const useAttributes = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectAttributes);
  const total        = useAppSelector(selectAttributeTotal);
  const page         = useAppSelector(selectAttributePage);
  const limit        = useAppSelector(selectAttributeLimit);
  const totalPages   = useAppSelector(selectAttributePages);
  const isLoading    = useAppSelector(selectAttributeLoading);
  const isSubmitting = useAppSelector(selectAttributeSubmitting);
  const error        = useAppSelector(selectAttributeError);

  const fetch = useCallback(
    (filters: AttributeFilters = {}) => dispatch(fetchAttributesThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreateAttributePayload) => dispatch(createAttributeThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdateAttributePayload) =>
      dispatch(updateAttributeThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteAttributeThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setAttributePage(p));
      dispatch(fetchAttributesThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearAttributeError()),
  };
};