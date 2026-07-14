export type ProductStatus = 'draft' | 'active' | 'archived' | 'D';

export interface Product {
  product_no:   number;
  product_id:   string;
  category_no:  number;
  sku:          string;
  product_name: string;
  slug:         string;
  description:  string;
  base_price:   number;
  status:       ProductStatus;
  is_featured:  boolean;
  stock_qty:    number;
  created_at:   string;
  created_by:   number | null;
  updated_at:   string;
  updated_by:   number | null;
}

export interface ProductVariant {
  variant_no:     number;
  variant_id:     string;
  product_no:     number;
  sku:            string;
  price_override: number | null;
  stock_qty:      number;
  weight_kg:      number | null;
  image_url:      string | null;
  status:         ProductStatus;
  created_at:     string;
  created_by:     number | null;
  updated_at:     string;
  updated_by:     number | null;
}