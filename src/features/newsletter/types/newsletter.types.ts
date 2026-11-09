import type { Subscriber, Campaign } from '../../../domain/entities/Newsletter';

export interface NewsletterState {
  // subscribers
  subscribers:        Subscriber[];
  subscriberTotal:    number;
  subscriberPage:     number;
  subscriberLimit:    number;
  subscriberPages:    number;
  // campaigns
  campaigns:          Campaign[];
  campaignTotal:      number;
  campaignPage:       number;
  campaignPages:      number;
  // shared
  isLoading:          boolean;
  isSubmitting:       boolean;
  isSending:          boolean;
  error:              string | null;
}
