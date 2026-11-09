export interface Coupon {
  coupon_no:        number;
  coupon_id:        string;
  code:             string;
  description:      string;
  discount_type:    'percentage' | 'fixed';
  discount_value:   number;
  min_order_amount: number;
  max_uses:         number | null;
  used_count:       number;
  valid_from:       string;
  valid_until:      string | null;
  status:           'A' | 'I' | 'D';
  created_at:       string;
  updated_at:       string;
}
