export type ProductStatus = 'draft' | 'active' | 'archived' | 'D';

export interface Product {
  product_id:      string;
  category_id?:    string;   // ← UUID
  sku:             string;
  product_name:    string;
  slug:            string;
  description:     string | null;
  image_url:       string | null;
  is_featured:     boolean;
  stock_qty:       number;
  status:          string;
  features?:       string[];
  specifications?: { key: string; value: string }[];
  created_at?:     string;
}

export interface ProductVariant {
  variant_no:     number;
  variant_id:     string;
  product_no:     number;
  sku:            string;
  mrp:            number | null;
  selling_price:  number | null;
  cost_price:     number | null;
  stock_qty:      number;
  weight_kg:      number | null;
  image_url:      string | null;
  status:         ProductStatus;
  created_at:     string;
  created_by:     number | null;
  updated_at:     string;
  updated_by:     number | null;
}