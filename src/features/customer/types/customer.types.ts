import type { Customer } from '../../../domain/entities/Customer';

export interface CustomerState {
  items:        Customer[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}