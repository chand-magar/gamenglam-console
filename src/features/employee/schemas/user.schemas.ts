import { z } from 'zod';

export const createUserSchema = z.object({
  user_fullname: z.string().min(2, 'Full name is required').max(65),
  email_id:      z.string().email('Valid email is required'),
  mobile_no:     z.string().max(15).nullable().optional(),
  gender:        z.enum(['male', 'female', 'other', '']).optional(),
  role_no:       z.number({ error: 'Role is required' }).min(1, 'Role is required'),
  password:      z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z.object({
  user_fullname: z.string().min(2).max(65).optional(),
  email_id:      z.string().email().optional(),
  gender:        z.enum(['male', 'female', 'other', '']).optional(),
  mobile_no:     z.string().max(15).nullable().optional(),
  address:       z.string().nullable().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;