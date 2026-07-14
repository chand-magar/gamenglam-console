import type { Page } from '../entities/Page';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface PageFilters {
  page?:       number;
  limit?:      number;
  status?:     string;
  section_no?: number;
  search?:     string;
}

export interface CreatePagePayload {
  section_no: number;
  page_name:  string;
  page_path:  string;
  page_order: number;
}

export interface UpdatePagePayload {
  section_no?: number;
  page_name?:  string;
  page_path?:  string;
  page_order?: number;
}

export interface IPageRepository {
  getAll(filters?: PageFilters): Promise<PaginatedResponse<Page>>;
  getById(id: string): Promise<Page>;
  create(payload: CreatePagePayload): Promise<Page>;
  update(id: string, payload: UpdatePagePayload): Promise<Page>;
  delete(id: string): Promise<void>;
}