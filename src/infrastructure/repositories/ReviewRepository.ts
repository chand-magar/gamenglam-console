import axiosInstance from '../../core/api/axiosInstance';
import type { IReviewRepository, ReviewFilters } from '../../domain/repositories/IReviewRepository';
import type { Review } from '../../domain/entities/Review';
import type { PaginatedResponse } from '../../core/types/common.types';

export class ReviewRepository implements IReviewRepository {
  async getAll(filters?: ReviewFilters): Promise<PaginatedResponse<Review>> {
    const { data } = await axiosInstance.get<{
      success: boolean;
      data: { items: Review[]; total: number; page: number; limit: number; total_pages: number };
    }>('/reviews', { params: filters });
    const d = data.data;
    return {
      items:      Array.isArray(d?.items) ? d.items : [],
      total:      d?.total       ?? 0,
      page:       d?.page        ?? 1,
      limit:      d?.limit       ?? 10,
      totalPages: d?.total_pages ?? 0,
    };
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/reviews/${id}`);
  }
}
