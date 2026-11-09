export interface Review {
  review_id:     string;
  product_id:    string;
  product_name:  string;
  customer_name: string;
  rating:        number;
  title:         string;
  body:          string;
  status:        'A' | 'I' | 'D';
  created_at:    string;
}
