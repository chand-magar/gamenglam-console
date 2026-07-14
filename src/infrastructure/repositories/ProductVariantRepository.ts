import axiosInstance from '../../core/api/axiosInstance';
import type {
  IProductVariantRepository,
  CreateVariantPayload,
  UpdateVariantPayload,
} from '../../domain/repositories/IProductRepository';
import type { ProductVariant } from '../../domain/entities/Product';
import type { ApiResponse } from '../../core/types/common.types';

export class ProductVariantRepository implements IProductVariantRepository {
  async getAllByProduct(productId: string): Promise<ProductVariant[]> {
    const { data } = await axiosInstance.get<ApiResponse<ProductVariant[]>>(
      `/products/${productId}/variants`,
    );
    return Array.isArray(data.data) ? data.data : [];
  }

  async getById(id: string): Promise<ProductVariant> {
    const { data } = await axiosInstance.get<ApiResponse<ProductVariant>>(
      `/product-variants/${id}`,
    );
    return data.data;
  }

  async create(payload: CreateVariantPayload): Promise<ProductVariant> {
    const { data } = await axiosInstance.post<ApiResponse<ProductVariant>>(
      '/product-variants',
      payload,
    );
    return data.data;
  }

  async update(id: string, payload: UpdateVariantPayload): Promise<ProductVariant> {
    const { data } = await axiosInstance.put<ApiResponse<ProductVariant>>(
      `/product-variants/${id}`,
      payload,
    );
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/product-variants/${id}`);
  }
}