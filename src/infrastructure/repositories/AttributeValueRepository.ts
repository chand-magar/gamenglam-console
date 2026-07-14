import axiosInstance from '../../core/api/axiosInstance';
import type {
  IAttributeValueRepository,
  AttributeValueFilters,
  CreateAttributeValuePayload,
  UpdateAttributeValuePayload,
} from '../../domain/repositories/IAttributeValueRepository';
import type { AttributeValue } from '../../domain/entities/AttributeValue';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class AttributeValueRepository implements IAttributeValueRepository {

  // Used by AttributeValues page — nested under a specific attribute
  async getAll(
    attributeId: string,
    filters?: AttributeValueFilters,
  ): Promise<PaginatedResponse<AttributeValue>> {
    const { data } = await axiosInstance.get<ApiResponse<AttributeValue[]>>(
      `/attributes/${attributeId}/values`,
      { params: filters },
    );
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      items,
      total:      items.length,
      page:       filters?.page  ?? 1,
      limit:      filters?.limit ?? 50,
      totalPages: Math.ceil(items.length / (filters?.limit ?? 50)),
    };
  }

  // Used by ProductVariants page — flat call to get ALL values across all attributes
  async getAllFlat(filters?: AttributeValueFilters): Promise<PaginatedResponse<AttributeValue>> {
    const { data } = await axiosInstance.get<ApiResponse<AttributeValue[]>>(
      '/attribute-values',
      { params: filters },
    );
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      items,
      total:      items.length,
      page:       filters?.page  ?? 1,
      limit:      filters?.limit ?? 100,
      totalPages: Math.ceil(items.length / (filters?.limit ?? 100)),
    };
  }

  async create(
    attributeId: string,
    payload: CreateAttributeValuePayload,
  ): Promise<AttributeValue> {
    const { data } = await axiosInstance.post<ApiResponse<AttributeValue>>(
      `/attributes/${attributeId}/values`,
      payload,
    );
    return data.data;
  }

  async update(
    id: string,
    payload: UpdateAttributeValuePayload,
  ): Promise<AttributeValue> {
    const { data } = await axiosInstance.put<ApiResponse<AttributeValue>>(
      `/attribute-values/${id}`,
      payload,
    );
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/attribute-values/${id}`);
  }
}