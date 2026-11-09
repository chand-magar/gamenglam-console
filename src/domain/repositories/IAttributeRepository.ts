import type { Attribute } from '../entities/Attribute';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface AttributeFilters {
  page?:        number;
  limit?:       number;
  status?:      string;
  category_no?: number;
  is_variant?:  boolean;
  search?:      string;
}

export interface CreateAttributePayload {
  category_id:    string;   // ← UUID
  attribute_name: string;
  code:           string;
  type:           string;
  is_required:    boolean;
  is_variant:     boolean;
  show_in_filter: boolean;
  sort_order:     number;
}

export interface UpdateAttributePayload {
  category_id?:    string;  // ← UUID
  attribute_name?: string;
  code?:           string;
  type?:           string;
  is_required?:    boolean;
  is_variant?:     boolean;
  show_in_filter: boolean;
  sort_order?:     number;
}

export interface IAttributeRepository {
  getAll(filters?: AttributeFilters): Promise<PaginatedResponse<Attribute>>;
  getById(id: string): Promise<Attribute>;
  create(payload: CreateAttributePayload): Promise<Attribute>;
  update(id: string, payload: UpdateAttributePayload): Promise<Attribute>;
  delete(id: string): Promise<void>;
}