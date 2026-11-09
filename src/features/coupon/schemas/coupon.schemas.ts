import { z } from 'zod';

export const couponSchema = z.object({
  code:             z.string().min(3, 'Code must be at least 3 characters').max(50),
  description:      z.string().optional(),
  discount_type:    z.enum(['percentage', 'fixed']),
  discount_value:   z.coerce.number().gt(0, 'Must be greater than 0'),
  min_order_amount: z.coerce.number().min(0).optional(),
  max_uses:         z.coerce.number().int().positive().nullable().optional(),
  valid_from:       z.string().min(1, 'Start date is required'),
  valid_until:      z.string().nullable().optional(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
