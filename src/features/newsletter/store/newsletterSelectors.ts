import type { RootState } from '../../../app/store/index';

export const selectSubscribers     = (s: RootState) => s.newsletter.subscribers;
export const selectSubscriberTotal = (s: RootState) => s.newsletter.subscriberTotal;
export const selectSubscriberPage  = (s: RootState) => s.newsletter.subscriberPage;
export const selectSubscriberPages = (s: RootState) => s.newsletter.subscriberPages;
export const selectSubscriberLimit = (s: RootState) => s.newsletter.subscriberLimit;

export const selectCampaigns       = (s: RootState) => s.newsletter.campaigns;
export const selectCampaignTotal   = (s: RootState) => s.newsletter.campaignTotal;
export const selectCampaignPage    = (s: RootState) => s.newsletter.campaignPage;
export const selectCampaignPages   = (s: RootState) => s.newsletter.campaignPages;

export const selectNewsletterLoading    = (s: RootState) => s.newsletter.isLoading;
export const selectNewsletterSubmitting = (s: RootState) => s.newsletter.isSubmitting;
export const selectNewsletterSending    = (s: RootState) => s.newsletter.isSending;
export const selectNewsletterError      = (s: RootState) => s.newsletter.error;
