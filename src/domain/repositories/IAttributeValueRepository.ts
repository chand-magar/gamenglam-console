import type { AttributeValue } from '../entities/AttributeValue';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface AttributeValueFilters {
  page?:   number;
  limit?:  number;
  status?: string;
}

export interface CreateAttributeValuePayload {
  value:         string;
  display_label: string;
  color_hex?:    string | null;
  sort_order:    number;
}

export interface UpdateAttributeValuePayload {
  value?:         string;
  display_label?: string;
  color_hex?:     string | null;
  sort_order?:    number;
}

export interface IAttributeValueRepository {
  getAll(attributeId: string, filters?: AttributeValueFilters): Promise<PaginatedResponse<AttributeValue>>;
  create(attributeId: string, payload: CreateAttributeValuePayload): Promise<AttributeValue>;
  update(id: string, payload: UpdateAttributeValuePayload): Promise<AttributeValue>;
  delete(id: string): Promise<void>;
}