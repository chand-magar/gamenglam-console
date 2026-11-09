import type { Coupon } from '../../../domain/entities/Coupon';

export interface CouponState {
  items:        Coupon[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}
