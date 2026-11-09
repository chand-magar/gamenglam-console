export interface InventoryItem {
  variant_no:     number;
  variant_id:     string;
  product_no:     number;
  product_id:     string;
  product_name:   string;
  category_no:    number;
  category_name:  string;
  image_url:      string | null; // ← was string, must allow null
  sku:            string;
  stock_qty:      number;
  mrp:            number | null;
  selling_price:  number | null;
  cost_price:     number | null;
  weight_kg:      number | null;
  status:         string;
  updated_at:     string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(qty: number): StockStatus {
  if (qty === 0)  return 'out_of_stock';
  if (qty < 5)   return 'low_stock';
  return 'in_stock';
}