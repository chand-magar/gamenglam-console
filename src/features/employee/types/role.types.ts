import type { Role } from '../../../domain/entities/Role';

export interface RoleState {
  items:        Role[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}