import axiosInstance from '../../core/api/axiosInstance';
import type {
  IOrderRepository,
  OrderFilters,
  UpdateOrderStatusPayload,
} from '../../domain/repositories/IOrderRepository';
import type { Order, OrderStatusHistory } from '../../domain/entities/Order';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

interface OrderListResponse {
  data:        Order[];
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
}

export class OrderRepository implements IOrderRepository {
  async getAll(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const { data } = await axiosInstance.get<OrderListResponse>(
      '/orders',
      { params: filters },
    );
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      items,
      total:      data.total       ?? items.length,
      page:       data.page        ?? filters?.page  ?? 1,
      limit:      data.limit       ?? filters?.limit ?? 10,
      totalPages: data.total_pages ?? 1,
    };
  }

  async getById(orderId: string): Promise<Order> {
    const { data } = await axiosInstance.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return data.data;
  }

  async getHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const { data } = await axiosInstance.get<ApiResponse<OrderStatusHistory[]>>(
      `/orders/${orderId}/history`,
    );
    return Array.isArray(data.data) ? data.data : [];
  }

  async updateStatus(orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    const { data } = await axiosInstance.put<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      payload,
    );
    return data.data;
  }
}