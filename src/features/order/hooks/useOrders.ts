import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchOrdersThunk, fetchOrderDetailThunk,
  updateOrderStatusThunk, clearOrderError,
  clearSelectedOrder, setOrderPage,
} from '../store/orderSlice';
import {
  selectOrders, selectOrderTotal, selectOrderPage,
  selectOrderLimit, selectOrderPages,
  selectSelectedOrder, selectOrderHistory,
  selectOrderLoading, selectOrderDetailLoading,
  selectOrderSubmitting, selectOrderError,
} from '../store/orderSelectors';
import type { OrderFilters, UpdateOrderStatusPayload } from '../../../domain/repositories/IOrderRepository';

export const useOrders = () => {
  const dispatch        = useAppDispatch();
  const items           = useAppSelector(selectOrders);
  const total           = useAppSelector(selectOrderTotal);
  const page            = useAppSelector(selectOrderPage);
  const limit           = useAppSelector(selectOrderLimit);
  const totalPages      = useAppSelector(selectOrderPages);
  const selectedOrder   = useAppSelector(selectSelectedOrder);
  const orderHistory    = useAppSelector(selectOrderHistory);
  const isLoading       = useAppSelector(selectOrderLoading);
  const isDetailLoading = useAppSelector(selectOrderDetailLoading);
  const isSubmitting    = useAppSelector(selectOrderSubmitting);
  const error           = useAppSelector(selectOrderError);

  const fetch = useCallback(
    (filters: OrderFilters = {}) => dispatch(fetchOrdersThunk(filters)),
    [dispatch],
  );

  const fetchDetail = useCallback(
    (orderId: string) => dispatch(fetchOrderDetailThunk(orderId)),
    [dispatch],
  );

  const updateStatus = useCallback(
    (orderId: string, payload: UpdateOrderStatusPayload) =>
      dispatch(updateOrderStatusThunk({ orderId, payload })),
    [dispatch],
  );

  const clearSelected = useCallback(
    () => dispatch(clearSelectedOrder()),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setOrderPage(p));
      dispatch(fetchOrdersThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    selectedOrder, orderHistory,
    isLoading, isDetailLoading, isSubmitting, error,
    fetch, fetchDetail, updateStatus, clearSelected, changePage,
    dismissError: () => dispatch(clearOrderError()),
  };
};