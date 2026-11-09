export interface User {
  profile_no:    number;
  profile_id:    string;
  role_no:       number;
  user_fullname: string;
  email_id:      string;
  gender:        string | null;
  dob:           string | null;
  mobile_no:     string | null;
  address:       string | null;
  x_api_key:     string | null;
  secret_key:    string | null;
  status:        'A' | 'I' | 'D';
  created_at:    string;
  created_by:    number | null;
  updated_at:    string;
  updated_by:    number | null;
}