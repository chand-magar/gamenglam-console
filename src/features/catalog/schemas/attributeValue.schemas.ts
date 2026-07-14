import { z } from 'zod';

export const attributeValueSchema = z.object({
  value: z
    .string()
    .min(1, 'Value is required')
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and underscores only'),
  display_label: z.string().min(1, 'Display label is required').max(255),
  color_hex: z
    .union([
      z.literal(''),
      z.literal(null),
      z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
    ])
    .nullable()
    .optional(),
  sort_order: z.number().min(0),
});

export type AttributeValueFormValues = z.infer<typeof attributeValueSchema>;