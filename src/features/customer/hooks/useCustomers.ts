import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchCustomersThunk, deleteCustomerThunk,
  clearCustomerError, setCustomerPage,
} from '../store/customerSlice';
import {
  selectCustomers, selectCustomerTotal, selectCustomerPage,
  selectCustomerLimit, selectCustomerPages,
  selectCustomerLoading, selectCustomerSubmitting, selectCustomerError,
} from '../store/customerSelectors';
import type { CustomerFilters } from '../../../domain/repositories/ICustomerRepository';

export const useCustomers = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectCustomers);
  const total        = useAppSelector(selectCustomerTotal);
  const page         = useAppSelector(selectCustomerPage);
  const limit        = useAppSelector(selectCustomerLimit);
  const totalPages   = useAppSelector(selectCustomerPages);
  const isLoading    = useAppSelector(selectCustomerLoading);
  const isSubmitting = useAppSelector(selectCustomerSubmitting);
  const error        = useAppSelector(selectCustomerError);

  const fetch = useCallback(
    (filters: CustomerFilters = {}) => dispatch(fetchCustomersThunk(filters)),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteCustomerThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setCustomerPage(p));
      dispatch(fetchCustomersThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, remove, changePage,
    dismissError: () => dispatch(clearCustomerError()),
  };
};