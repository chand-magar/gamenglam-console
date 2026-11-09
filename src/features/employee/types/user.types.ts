import type { User } from '../../../domain/entities/User';

export interface UserState {
  items:        User[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}