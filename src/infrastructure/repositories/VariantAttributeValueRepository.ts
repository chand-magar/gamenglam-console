import axiosInstance from '../../core/api/axiosInstance';
import type { VariantAttributeValue } from '../../domain/entities/VariantAttributeValue';
import type { ApiResponse } from '../../core/types/common.types';

export class VariantAttributeValueRepository {
  async getByVariantId(variantId: string): Promise<VariantAttributeValue[]> {
    const { data } = await axiosInstance.get<ApiResponse<VariantAttributeValue[]>>(
      `/product-variants/${variantId}/attribute-values`,
    );
    return Array.isArray(data.data) ? data.data : [];
  }

  async create(payload: {
    variant_no:        number;
    attribute_value_no: number;
  }): Promise<VariantAttributeValue> {
    const { data } = await axiosInstance.post<ApiResponse<VariantAttributeValue>>(
      '/variant-attribute-values',
      payload,
    );
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/variant-attribute-values/${id}`);
  }
}