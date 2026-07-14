import axiosInstance from '../../core/api/axiosInstance';
import type {
  IPageRepository,
  PageFilters,
  CreatePagePayload,
  UpdatePagePayload,
} from '../../domain/repositories/IPageRepository';
import type { Page } from '../../domain/entities/Page';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class PageRepository implements IPageRepository {
  async getAll(filters?: PageFilters): Promise<PaginatedResponse<Page>> {
    const { data } = await axiosInstance.get<ApiResponse<Page[]>>(
      '/pages',
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

  async getById(id: string): Promise<Page> {
    const { data } = await axiosInstance.get<ApiResponse<Page>>(`/pages/${id}`);
    return data.data;
  }

  async create(payload: CreatePagePayload): Promise<Page> {
    const { data } = await axiosInstance.post<ApiResponse<Page>>('/pages', payload);
    return data.data;
  }

  async update(id: string, payload: UpdatePagePayload): Promise<Page> {
    const { data } = await axiosInstance.put<ApiResponse<Page>>(`/pages/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/pages/${id}`);
  }
}