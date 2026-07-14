import type { Category } from '../../../domain/entities/Category';

export interface CategoryState {
  items: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}