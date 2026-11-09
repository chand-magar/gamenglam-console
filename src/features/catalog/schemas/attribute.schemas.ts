import { z } from 'zod';

export const attributeSchema = z.object({
  category_id:    z.string().min(1, 'Category is required'),
  attribute_name: z.string().min(2).max(100),
  code:           z.string().min(2).max(50),
  type:           z.enum(['select', 'multi_select', 'boolean', 'text', 'number', 'color']),
  is_required:    z.boolean(),
  is_variant:     z.boolean(),
  show_in_filter: z.boolean(), // ← add
  sort_order:     z.number().min(0),
});

export type AttributeFormValues = z.infer<typeof attributeSchema>;