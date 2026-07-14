import axiosInstance from '../../core/api/axiosInstance';
import type {
  IProductRepository,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from '../../domain/repositories/IProductRepository';
import type { Product } from '../../domain/entities/Product';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class ProductRepository implements IProductRepository {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<Product>>>(
      '/products',
      { params: filters },
    );
    const raw = data.data;
    if (raw && typeof raw === 'object' && 'items' in raw) return raw;
    const items = Array.isArray(raw) ? (raw as Product[]) : [];
    return {
      items,
      total:      items.length,
      page:       filters?.page  ?? 1,
      limit:      filters?.limit ?? 10,
      totalPages: Math.ceil(items.length / (filters?.limit ?? 10)),
    };
  }

  async getById(id: string): Promise<Product> {
    const { data } = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  }

  async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = await axiosInstance.post<ApiResponse<Product>>('/products', payload);
    return data.data;
  }

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = await axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/products/${id}`);
  }
}