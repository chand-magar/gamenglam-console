import { z } from 'zod';

export const sectionSchema = z.object({
  section_name:  z.string().min(2, 'Section name is required').max(65),
  section_path:  z.string().min(2, 'Section path is required').max(65)
    .regex(/^\/[a-z0-9-/]*$/, 'Path must start with / and use lowercase letters, numbers and hyphens'),
  section_icon:  z.string().min(2, 'Section icon is required').max(65),
  section_order: z.number().min(0),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;