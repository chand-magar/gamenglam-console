export interface Page {
  page_no:    number;
  page_id:    string;
  section_no: number;
  page_name:  string;
  page_path:  string;
  page_order: number;
  status:     'A' | 'I' | 'D';
  created_at: string;
  created_by: number | null;
  updated_at: string;
  updated_by: number | null;
}