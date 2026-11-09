import type { InventoryItem } from '../entities/Inventory';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface InventoryFilters {
  page?:        number;
  limit?:       number;
  category_no?: number;
  status?:      string;
  stock_status?: 'all' | 'low' | 'out';
}

export interface IInventoryRepository {
  getAll(filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>>;
  updateStock(variantId: string, stockQty: number): Promise<void>;
}