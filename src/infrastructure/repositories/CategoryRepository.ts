import axiosInstance from '../../core/api/axiosInstance';
import type {
  ICategoryRepository,
  CategoryFilters,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../domain/repositories/ICategoryRepository';
import type { Category } from '../../domain/entities/Category';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';
export class CategoryRepository implements ICategoryRepository {
  async getAll(filters?: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const { data } = await axiosInstance.get<ApiResponse<Category[]>>(
      '/categories',
      { params: filters },
    );

    // API returns plain array — normalize to PaginatedResponse
    const items = Array.isArray(data.data) ? data.data : [];

    return {
      items,
      total:      items.length,
      page:       filters?.page  ?? 1,
      limit:      filters?.limit ?? 10,
      totalPages: Math.ceil(items.length / (filters?.limit ?? 10)),
    };
  }

  async getById(id: number): Promise<Category> {
    const { data } = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/${id}`,
    );
    return data.data;
  }

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const body: Record<string, unknown> = {
      category_name: payload.category_name,
      slug:          payload.slug,
      details:       payload.details   ?? null,
      parent_id:     payload.parent_id ?? null,
    };

    const { data } = await axiosInstance.post<ApiResponse<Category>>(
      '/categories',
      body,
    );
    return data.data;
  }

  async update(id: number, payload: UpdateCategoryPayload): Promise<Category> {
    const body: Record<string, unknown> = {};

    if (payload.category_name !== undefined) body.category_name = payload.category_name;
    if (payload.slug          !== undefined) body.slug          = payload.slug;
    if (payload.details       !== undefined) body.details       = payload.details;
    if (payload.parent_id     !== undefined) body.parent_id     = payload.parent_id ?? null;

    const { data } = await axiosInstance.put<ApiResponse<Category>>(
      `/categories/${id}`,
      body,
    );
    return data.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/categories/${id}`);
  }
}