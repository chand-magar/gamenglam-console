import type { Review } from '../entities/Review';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface ReviewFilters {
  page?:   number;
  limit?:  number;
  search?: string;
  rating?: number;
  status?: string;
}

export interface IReviewRepository {
  getAll(filters?: ReviewFilters): Promise<PaginatedResponse<Review>>;
  delete(id: string): Promise<void>;
}
