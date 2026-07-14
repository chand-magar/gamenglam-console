import type { Category } from '../entities/Category';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface CategoryFilters {
  page?:      number;
  limit?:     number;
  status?:    string;
  parent_no?: number | null;
  search?:    string;
}

export interface CreateCategoryPayload {
  category_name: string;
  slug:          string;
  details?:      string;
  parent_no?:    number | null;
  image?:        File | null;
}

export interface UpdateCategoryPayload {
  category_name?: string;
  slug?:          string;
  details?:       string;
  parent_no?:     number | null;
  image?:         File | null;
}

export interface ICategoryRepository {
  getAll(filters?: CategoryFilters): Promise<PaginatedResponse<Category>>;
  getById(id: number): Promise<Category>;
  create(payload: CreateCategoryPayload): Promise<Category>;
  update(id: number, payload: UpdateCategoryPayload): Promise<Category>;
  delete(id: number): Promise<void>;
}