import axiosInstance from '../../core/api/axiosInstance';
import type {
  IAttributeRepository,
  AttributeFilters,
  CreateAttributePayload,
  UpdateAttributePayload,
} from '../../domain/repositories/IAttributeRepository';
import type { Attribute } from '../../domain/entities/Attribute';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class AttributeRepository implements IAttributeRepository {
  async getAll(filters?: AttributeFilters): Promise<PaginatedResponse<Attribute>> {
    const { data } = await axiosInstance.get<ApiResponse<Attribute[]>>(
      '/attributes',
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

  async getById(id: string): Promise<Attribute> {
    const { data } = await axiosInstance.get<ApiResponse<Attribute>>(
      `/attributes/${id}`,
    );
    return data.data;
  }

  async create(payload: CreateAttributePayload): Promise<Attribute> {
    const { data } = await axiosInstance.post<ApiResponse<Attribute>>(
      '/attributes',
      payload,
    );
    return data.data;
  }

  async update(id: string, payload: UpdateAttributePayload): Promise<Attribute> {
    const { data } = await axiosInstance.put<ApiResponse<Attribute>>(
      `/attributes/${id}`,
      payload,
    );
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/attributes/${id}`);
  }
}