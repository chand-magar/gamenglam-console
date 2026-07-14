export type AttributeType = 'select' | 'multi_select' | 'boolean' | 'text' | 'number' | 'color';

export interface Attribute {
  attribute_no:   number;
  attribute_id:   string;
  category_no:    number;
  attribute_name: string;
  code:           string;
  type:           AttributeType;
  is_required:    boolean;
  is_variant:     boolean;
  sort_order:     number;
  status:         'A' | 'I' | 'D';
  created_at:     string;
  created_by:     number | null;
  updated_at:     string;
  updated_by:     number | null;
}