import { z } from 'zod';

export const pageSchema = z.object({
  section_no: z.number({ error: 'Section is required' }).min(1, 'Section is required'),
  page_name:  z.string().min(2, 'Page name is required').max(65),
  page_path:  z.string().min(2, 'Page path is required').max(65)
    .regex(/^\/[a-z0-9-/]*$/, 'Path must start with / and use lowercase letters, numbers and hyphens'),
  page_order: z.number().min(0),
});

export type PageFormValues = z.infer<typeof pageSchema>;