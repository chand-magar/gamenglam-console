import axiosInstance from '../../core/api/axiosInstance';
import type {
  ICouponRepository,
  CouponFilters,
  CreateCouponPayload,
  UpdateCouponPayload,
} from '../../domain/repositories/ICouponRepository';
import type { Coupon } from '../../domain/entities/Coupon';
import type { PaginatedResponse } from '../../core/types/common.types';

export class CouponRepository implements ICouponRepository {
  async getAll(filters?: CouponFilters): Promise<PaginatedResponse<Coupon>> {
    const { data } = await axiosInstance.get<{ success: boolean; data: { items: Coupon[]; total: number; page: number; limit: number; total_pages: number } }>(
      '/coupons',
      { params: filters },
    );
    const d = data.data;
    return {
      items:      Array.isArray(d?.items) ? d.items : [],
      total:      d?.total      ?? 0,
      page:       d?.page       ?? 1,
      limit:      d?.limit      ?? 10,
      totalPages: d?.total_pages ?? 0,
    };
  }

  async getById(id: string): Promise<Coupon> {
    const { data } = await axiosInstance.get<{ success: boolean; data: Coupon }>(`/coupons/${id}`);
    return data.data;
  }

  async create(payload: CreateCouponPayload): Promise<Coupon> {
    const { data } = await axiosInstance.post<{ success: boolean; data: Coupon }>('/coupons', payload);
    return data.data;
  }

  async update(id: string, payload: UpdateCouponPayload): Promise<Coupon> {
    const { data } = await axiosInstance.put<{ success: boolean; data: Coupon }>(`/coupons/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/coupons/${id}`);
  }
}
