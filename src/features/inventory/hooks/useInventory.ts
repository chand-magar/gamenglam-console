import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchInventoryThunk, updateStockThunk,
  clearInventoryError, setInventoryPage,
} from '../store/inventorySlice';
import {
  selectInventory, selectInventoryTotal, selectInventoryPage,
  selectInventoryLimit, selectInventoryPages,
  selectInventoryLoading, selectInventorySubmitting, selectInventoryError,
} from '../store/inventorySelectors';
import type { InventoryFilters } from '../../../domain/repositories/IInventoryRepository';

export const useInventory = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectInventory);
  const total        = useAppSelector(selectInventoryTotal);
  const page         = useAppSelector(selectInventoryPage);
  const limit        = useAppSelector(selectInventoryLimit);
  const totalPages   = useAppSelector(selectInventoryPages);
  const isLoading    = useAppSelector(selectInventoryLoading);
  const isSubmitting = useAppSelector(selectInventorySubmitting);
  const error        = useAppSelector(selectInventoryError);

  const fetch = useCallback(
    (filters: InventoryFilters = {}) => dispatch(fetchInventoryThunk(filters)),
    [dispatch],
  );

  const updateStock = useCallback(
    (variantId: string, stockQty: number) =>
      dispatch(updateStockThunk({ variantId, stockQty })),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setInventoryPage(p));
      dispatch(fetchInventoryThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, updateStock, changePage,
    dismissError: () => dispatch(clearInventoryError()),
  };
};