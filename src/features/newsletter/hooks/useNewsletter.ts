import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchSubscribersThunk, addSubscriberThunk, deleteSubscriberThunk,
  fetchCampaignsThunk, sendCampaignThunk, clearError,
} from '../store/newsletterSlice';
import {
  selectSubscribers, selectSubscriberTotal, selectSubscriberPage,
  selectSubscriberPages, selectSubscriberLimit,
  selectCampaigns, selectCampaignTotal, selectCampaignPage, selectCampaignPages,
  selectNewsletterLoading, selectNewsletterSubmitting, selectNewsletterSending, selectNewsletterError,
} from '../store/newsletterSelectors';
import type { SubscriberFilters, AddSubscriberPayload, SendCampaignPayload } from '../../../domain/repositories/INewsletterRepository';

export const useNewsletter = () => {
  const dispatch = useAppDispatch();

  const subscribers     = useAppSelector(selectSubscribers);
  const subscriberTotal = useAppSelector(selectSubscriberTotal);
  const subscriberPage  = useAppSelector(selectSubscriberPage);
  const subscriberPages = useAppSelector(selectSubscriberPages);
  const subscriberLimit = useAppSelector(selectSubscriberLimit);

  const campaigns     = useAppSelector(selectCampaigns);
  const campaignTotal = useAppSelector(selectCampaignTotal);
  const campaignPage  = useAppSelector(selectCampaignPage);
  const campaignPages = useAppSelector(selectCampaignPages);

  const isLoading    = useAppSelector(selectNewsletterLoading);
  const isSubmitting = useAppSelector(selectNewsletterSubmitting);
  const isSending    = useAppSelector(selectNewsletterSending);
  const error        = useAppSelector(selectNewsletterError);

  const fetchSubscribers = useCallback(
    (filters: SubscriberFilters = {}) => dispatch(fetchSubscribersThunk(filters)),
    [dispatch],
  );
  const addSubscriber = useCallback(
    (payload: AddSubscriberPayload) => dispatch(addSubscriberThunk(payload)),
    [dispatch],
  );
  const deleteSubscriber = useCallback(
    (id: string) => dispatch(deleteSubscriberThunk(id)),
    [dispatch],
  );
  const fetchCampaigns = useCallback(
    (page?: number, limit?: number) => dispatch(fetchCampaignsThunk({ page, limit })),
    [dispatch],
  );
  const sendCampaign = useCallback(
    (payload: SendCampaignPayload) => dispatch(sendCampaignThunk(payload)),
    [dispatch],
  );
  const changeSubscriberPage = useCallback(
    (p: number) => dispatch(fetchSubscribersThunk({ page: p, limit: subscriberLimit })),
    [dispatch, subscriberLimit],
  );

  return {
    subscribers, subscriberTotal, subscriberPage, subscriberPages, subscriberLimit,
    campaigns, campaignTotal, campaignPage, campaignPages,
    isLoading, isSubmitting, isSending, error,
    fetchSubscribers, addSubscriber, deleteSubscriber,
    fetchCampaigns, sendCampaign, changeSubscriberPage,
    dismissError: () => dispatch(clearError()),
  };
};
