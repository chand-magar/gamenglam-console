import type { Section } from '../../../domain/entities/Section';

export interface SectionState {
  items:        Section[];
  total:        number;
  page:         number;
  limit:        number;
  totalPages:   number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}