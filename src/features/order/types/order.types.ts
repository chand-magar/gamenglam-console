import type { Order, OrderStatusHistory } from '../../../domain/entities/Order';

export interface OrderState {
  items:        Order[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  selectedOrder:    Order | null;
  orderHistory:     OrderStatusHistory[];
  isLoading:        boolean;
  isDetailLoading:  boolean;
  isSubmitting:     boolean;
  error:            string | null;
}