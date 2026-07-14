import axiosInstance from '../../core/api/axiosInstance';
import type {
  ISectionRepository,
  SectionFilters,
  CreateSectionPayload,
  UpdateSectionPayload,
} from '../../domain/repositories/ISectionRepository';
import type { Section } from '../../domain/entities/Section';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class SectionRepository implements ISectionRepository {
  async getAll(filters?: SectionFilters): Promise<PaginatedResponse<Section>> {
    const { data } = await axiosInstance.get<ApiResponse<Section[]>>(
      '/sections',
      { params: filters },
    );
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      items,
      total:      items.length,
      page:       filters?.page  ?? 1,
      limit:      filters?.limit ?? 10,
      totalPages: Math.ceil(items.length / (filters?.limit ?? 10)),
    };
  }

  async getById(id: string): Promise<Section> {
    const { data } = await axiosInstance.get<ApiResponse<Section>>(`/sections/${id}`);
    return data.data;
  }

  async create(payload: CreateSectionPayload): Promise<Section> {
    const { data } = await axiosInstance.post<ApiResponse<Section>>('/sections', payload);
    return data.data;
  }

  async update(id: string, payload: UpdateSectionPayload): Promise<Section> {
    const { data } = await axiosInstance.put<ApiResponse<Section>>(`/sections/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/sections/${id}`);
  }
}