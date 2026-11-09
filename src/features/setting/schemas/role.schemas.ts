import { z } from 'zod';

export const rolePagePermissionSchema = z.object({
  page_id:    z.string(),
  page_name:  z.string(),
  page_path:  z.string(),
  page_order: z.number(),
  methods:    z.array(z.string()),
});

export const roleSectionPermissionSchema = z.object({
  section_id:    z.string(),
  section_name:  z.string(),
  section_path:  z.string(),
  section_icon:  z.string(),
  section_order: z.number(),
  pages:         z.array(rolePagePermissionSchema),
});

export const roleSchema = z.object({
  role_name:    z.string().min(2, 'Role name is required').max(65),
  role_details: z.array(roleSectionPermissionSchema),
});

export type RoleFormValues = z.infer<typeof roleSchema>;