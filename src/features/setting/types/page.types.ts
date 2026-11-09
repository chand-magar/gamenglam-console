import type { Page } from '../../../domain/entities/Page';

export interface PageState {
  items:        Page[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}