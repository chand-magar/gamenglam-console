export interface Customer {
  customer_no: number;
  customer_id: string;
  first_name:  string;
  last_name:   string;
  email_id:    string;
  gender:      string | null;
  dob:         string | null;
  mobile_no:   string | null;
  status:      'A' | 'I' | 'D';
  created_at:  string;
  updated_at:  string;
}