import axiosInstance from '../../core/api/axiosInstance';
import type { VariantImage } from '../../domain/entities/VariantImage';
import type { ApiResponse }  from '../../core/types/common.types';

export class VariantImageRepository {
  async getByVariantId(variantId: string): Promise<VariantImage[]> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<VariantImage[]>>(
        `/product-variants/${variantId}/images`,
      );
      return Array.isArray(data.data) ? data.data : [];
    } catch { return []; }
  }

  // Fetch primary image for multiple variants in one request
  async getPrimaryBatch(variantIds: string[]): Promise<Record<string, string | null>> {
    if (variantIds.length === 0) return {};
    try {
      const { data } = await axiosInstance.post<ApiResponse<Record<string, string>>>(
        '/variant-images/primary-batch',
        { variant_ids: variantIds },
      );
      // Fill nulls for variants with no image
      const result: Record<string, string | null> = {};
      variantIds.forEach((id) => {
        result[id] = data.data?.[id] ?? null;
      });
      return result;
    } catch {
      const result: Record<string, string | null> = {};
      variantIds.forEach((id) => { result[id] = null; });
      return result;
    }
  }

  async uploadFiles(variantId: string, files: File[]): Promise<VariantImage[]> {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    const { data } = await axiosInstance.post<ApiResponse<VariantImage[]>>(
      `/product-variants/${variantId}/images/upload`,
      form,
    );
    return Array.isArray(data.data) ? data.data : [];
  }

  async saveURL(variantId: string, imageUrl: string, isPrimary = false): Promise<VariantImage> {
    const { data } = await axiosInstance.post<ApiResponse<VariantImage>>(
      `/product-variants/${variantId}/images/url`,
      { image_url: imageUrl, is_primary: isPrimary },
    );
    return data.data;
  }

  async delete(imageId: string): Promise<void> {
    await axiosInstance.delete(`/variant-images/${imageId}`);
  }
}