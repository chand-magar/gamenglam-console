import type { Subscriber, Campaign } from '../entities/Newsletter';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface SubscriberFilters {
  page?:   number;
  limit?:  number;
  search?: string;
  status?: string;
}

export interface AddSubscriberPayload {
  email: string;
  name?: string;
}

export interface SendCampaignPayload {
  subject: string;
  body:    string;
}

export interface INewsletterRepository {
  getSubscribers(filters?: SubscriberFilters): Promise<PaginatedResponse<Subscriber>>;
  addSubscriber(payload: AddSubscriberPayload): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<void>;
  getCampaigns(page?: number, limit?: number): Promise<PaginatedResponse<Campaign>>;
  sendCampaign(payload: SendCampaignPayload): Promise<Campaign>;
}
