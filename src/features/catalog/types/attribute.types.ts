import type { Attribute } from '../../../domain/entities/Attribute';

export interface AttributeState {
  items:        Attribute[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}