import type { RootState } from '../../../app/store/index';

export const selectOrders          = (s: RootState) => s.orders.items;
export const selectOrderTotal      = (s: RootState) => s.orders.total;
export const selectOrderPage       = (s: RootState) => s.orders.page;
export const selectOrderLimit      = (s: RootState) => s.orders.limit;
export const selectOrderPages      = (s: RootState) => s.orders.totalPages;
export const selectSelectedOrder   = (s: RootState) => s.orders.selectedOrder;
export const selectOrderHistory    = (s: RootState) => s.orders.orderHistory;
export const selectOrderLoading    = (s: RootState) => s.orders.isLoading;
export const selectOrderDetailLoading = (s: RootState) => s.orders.isDetailLoading;
export const selectOrderSubmitting = (s: RootState) => s.orders.isSubmitting;
export const selectOrderError      = (s: RootState) => s.orders.error;