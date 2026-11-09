export interface Subscriber {
  subscriber_id:  string;
  email:          string;
  name:           string;
  status:         'A' | 'I' | 'D';
  subscribed_at:  string;
  created_at:     string;
}

export interface Campaign {
  campaign_id:     string;
  subject:         string;
  body:            string;
  sent_status:     'draft' | 'sent' | 'failed';
  recipient_count: number;
  sent_at:         string | null;
  error_message:   string;
  created_at:      string;
}
