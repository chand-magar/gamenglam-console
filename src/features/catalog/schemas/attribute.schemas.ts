import { z } from 'zod';

export const attributeSchema = z.object({
  category_no: z
    .number({ error: 'Category is required' })
    .min(1, 'Category is required'),
  attribute_name: z.string().min(1, 'Attribute name is required').max(100),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Code must be lowercase letters, numbers and underscores only'),
  type: z.enum(['select', 'multi_select', 'boolean', 'text', 'number', 'color'], {
    error: 'Type is required',
  }),
  is_required: z.boolean(),
  is_variant:  z.boolean(),
  sort_order:  z.number().min(0),
});

export type AttributeFormValues = z.infer<typeof attributeSchema>;