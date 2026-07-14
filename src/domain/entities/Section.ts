export interface Section {
  section_no:    number;
  section_id:    string;
  section_name:  string;
  section_path:  string;
  section_icon:  string;
  section_order: number;
  status:        'A' | 'I' | 'D';
  created_at:    string;
  created_by:    number | null;
  updated_at:    string;
  updated_by:    number | null;
}