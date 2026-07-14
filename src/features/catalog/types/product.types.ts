import type { Product, ProductVariant } from '../../../domain/entities/Product';

export interface ProductState {
  items:        Product[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}

export interface ProductVariantState {
  items:        ProductVariant[];
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}