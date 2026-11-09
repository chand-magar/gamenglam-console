import { z } from 'zod';

export const categorySchema = z.object({
  category_name: z.string().min(1, 'Category name is required'),
  slug:          z.string().min(1, 'Slug is required')
                   .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  details:       z.string().optional(),
  parent_id:     z.string().nullable().optional(), // ← UUID string
});

export type CategoryFormValues = z.infer<typeof categorySchema>;