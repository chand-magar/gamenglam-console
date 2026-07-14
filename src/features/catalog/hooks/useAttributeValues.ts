import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchAttributeValuesThunk,
  createAttributeValueThunk,
  updateAttributeValueThunk,
  deleteAttributeValueThunk,
  clearAttributeValueError,
} from '../store/attributeValueSlice';
import {
  selectAttributeValues,
  selectAttributeValueTotal,
  selectAttributeValueLoading,
  selectAttributeValueSubmitting,
  selectAttributeValueError,
} from '../store/attributeValueSelectors';
import type {
  AttributeValueFilters,
  CreateAttributeValuePayload,
  UpdateAttributeValuePayload,
} from '../../../domain/repositories/IAttributeValueRepository';

export const useAttributeValues = (attributeId: string) => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectAttributeValues);
  const total        = useAppSelector(selectAttributeValueTotal);
  const isLoading    = useAppSelector(selectAttributeValueLoading);
  const isSubmitting = useAppSelector(selectAttributeValueSubmitting);
  const error        = useAppSelector(selectAttributeValueError);

  const fetch = useCallback(
    (filters: AttributeValueFilters = {}) =>
      dispatch(fetchAttributeValuesThunk({ attributeId, filters })),
    [dispatch, attributeId],
  );

  const create = useCallback(
    (payload: CreateAttributeValuePayload) =>
      dispatch(createAttributeValueThunk({ attributeId, payload })),
    [dispatch, attributeId],
  );

  const update = useCallback(
    (id: string, payload: UpdateAttributeValuePayload) =>
      dispatch(updateAttributeValueThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteAttributeValueThunk(id)),
    [dispatch],
  );

  return {
    items, total, isLoading, isSubmitting, error,
    fetch, create, update, remove,
    dismissError: () => dispatch(clearAttributeValueError()),
  };
};