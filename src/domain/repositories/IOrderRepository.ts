import type { Order, OrderStatus, OrderStatusHistory } from '../entities/Order';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface OrderFilters {
  page?:         number;
  limit?:        number;
  order_status?: OrderStatus | '';
  search?:       string;
}

export interface UpdateOrderStatusPayload {
  to_status:  OrderStatus;
  note?:      string | null;
  changed_by?: number | null;
}

export interface IOrderRepository {
  getAll(filters?: OrderFilters): Promise<PaginatedResponse<Order>>;
  getById(orderId: string): Promise<Order>;
  getHistory(orderId: string): Promise<OrderStatusHistory[]>;
  updateStatus(orderId: string, payload: UpdateOrderStatusPayload): Promise<Order>;
}