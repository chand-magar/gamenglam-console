import type { InventoryItem } from '../../../domain/entities/Inventory';

export interface InventoryState {
  items:        InventoryItem[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}