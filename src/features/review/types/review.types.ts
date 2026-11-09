import type { Review } from '../../../domain/entities/Review';

export interface ReviewState {
  items:        Review[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}
