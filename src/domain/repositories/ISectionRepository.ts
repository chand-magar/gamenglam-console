import type { Section } from '../entities/Section';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface SectionFilters {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
}

export interface CreateSectionPayload {
  section_name:  string;
  section_path:  string;
  section_icon:  string;
  section_order: number;
}

export interface UpdateSectionPayload {
  section_name?:  string;
  section_path?:  string;
  section_icon?:  string;
  section_order?: number;
}

export interface ISectionRepository {
  getAll(filters?: SectionFilters): Promise<PaginatedResponse<Section>>;
  getById(id: string): Promise<Section>;
  create(payload: CreateSectionPayload): Promise<Section>;
  update(id: string, payload: UpdateSectionPayload): Promise<Section>;
  delete(id: string): Promise<void>;
}