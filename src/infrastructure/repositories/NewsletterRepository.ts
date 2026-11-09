import axiosInstance from '../../core/api/axiosInstance';
import type {
  INewsletterRepository,
  SubscriberFilters,
  AddSubscriberPayload,
  SendCampaignPayload,
} from '../../domain/repositories/INewsletterRepository';
import type { Subscriber, Campaign } from '../../domain/entities/Newsletter';
import type { PaginatedResponse } from '../../core/types/common.types';

type PaginatedRaw<T> = { items: T[]; total: number; page: number; limit: number; total_pages: number };

export class NewsletterRepository implements INewsletterRepository {
  async getSubscribers(filters?: SubscriberFilters): Promise<PaginatedResponse<Subscriber>> {
    const { data } = await axiosInstance.get<{ success: boolean; data: PaginatedRaw<Subscriber> }>(
      '/newsletter/subscribers', { params: filters },
    );
    const d = data.data;
    return { items: d?.items ?? [], total: d?.total ?? 0, page: d?.page ?? 1, limit: d?.limit ?? 10, totalPages: d?.total_pages ?? 0 };
  }

  async addSubscriber(payload: AddSubscriberPayload): Promise<Subscriber> {
    const { data } = await axiosInstance.post<{ success: boolean; data: Subscriber }>(
      '/newsletter/subscribers', payload,
    );
    return data.data;
  }

  async deleteSubscriber(id: string): Promise<void> {
    await axiosInstance.delete(`/newsletter/subscribers/${id}`);
  }

  async getCampaigns(page = 1, limit = 10): Promise<PaginatedResponse<Campaign>> {
    const { data } = await axiosInstance.get<{ success: boolean; data: PaginatedRaw<Campaign> }>(
      '/newsletter/campaigns', { params: { page, limit } },
    );
    const d = data.data;
    return { items: d?.items ?? [], total: d?.total ?? 0, page: d?.page ?? 1, limit: d?.limit ?? 10, totalPages: d?.total_pages ?? 0 };
  }

  async sendCampaign(payload: SendCampaignPayload): Promise<Campaign> {
    const { data } = await axiosInstance.post<{ success: boolean; data: Campaign }>(
      '/newsletter/campaigns/send', payload,
    );
    return data.data;
  }
}
