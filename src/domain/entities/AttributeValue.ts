export interface AttributeValue {
  attribute_value_id: string;
  attribute_id?:      string;   // ← add
  value:                string;
  display_label:        string;
  color_hex:             string | null;
  sort_order:            number;
  status:                'A' | 'I' | 'D';
  created_at:            string;
  created_by:            number | null;
  updated_at:            string;
  updated_by:            number | null;
}