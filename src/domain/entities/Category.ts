export interface Category {
  category_no:   number;
  category_id:   string;
  parent_no:     number | null;
  parent_id:     string;
  category_name: string;
  slug:          string;
  details:       string | null;
  image_url?:    string | null;
  status:        'A' | 'I' | 'D';
  created_at:    string;
  created_by:    string | null;
  updated_at:    string;
  updated_by:    string | null;
}