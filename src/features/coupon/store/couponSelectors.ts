import type { RootState } from '../../../app/store/index';

export const selectCoupons           = (s: RootState) => s.coupons.items;
export const selectCouponTotal       = (s: RootState) => s.coupons.total;
export const selectCouponPage        = (s: RootState) => s.coupons.page;
export const selectCouponLimit       = (s: RootState) => s.coupons.limit;
export const selectCouponPages       = (s: RootState) => s.coupons.totalPages;
export const selectCouponLoading     = (s: RootState) => s.coupons.isLoading;
export const selectCouponSubmitting  = (s: RootState) => s.coupons.isSubmitting;
export const selectCouponError       = (s: RootState) => s.coupons.error;
