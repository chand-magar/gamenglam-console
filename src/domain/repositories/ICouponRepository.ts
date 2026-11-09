import type { Coupon } from '../entities/Coupon';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface CouponFilters {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
}

export interface CreateCouponPayload {
  code:             string;
  description?:     string;
  discount_type:    'percentage' | 'fixed';
  discount_value:   number;
  min_order_amount?: number;
  max_uses?:        number | null;
  valid_from:       string;
  valid_until?:     string | null;
}

export interface UpdateCouponPayload {
  description?:     string;
  discount_type?:   'percentage' | 'fixed';
  discount_value?:  number;
  min_order_amount?: number;
  max_uses?:        number | null;
  valid_from?:      string;
  valid_until?:     string | null;
  status?:          'A' | 'I';
}

export interface ICouponRepository {
  getAll(filters?: CouponFilters): Promise<PaginatedResponse<Coupon>>;
  getById(id: string): Promise<Coupon>;
  create(payload: CreateCouponPayload): Promise<Coupon>;
  update(id: string, payload: UpdateCouponPayload): Promise<Coupon>;
  delete(id: string): Promise<void>;
}
