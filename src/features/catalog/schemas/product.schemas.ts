import { z } from 'zod';

export const productSchema = z.object({
  category_no:  z.number({ error: 'Category is required' }).min(1, 'Category is required'),
  sku:          z.string().min(2, 'SKU is required').max(100),
  product_name: z.string().min(2, 'Product name is required').max(255),
  slug:         z.string().min(2, 'Slug is required').max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  description:  z.string().optional(),
  base_price:   z.number({ error: 'Price is required' }).gt(0, 'Price must be greater than 0'),
  is_featured:  z.boolean(),
  stock_qty:    z.number().min(0),
  status:       z.enum(['draft', 'active', 'archived']).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  sku:            z.string().min(2, 'SKU is required').max(100),
  price_override: z.number().nullable().optional(),
  stock_qty:      z.number().min(0),
  weight_kg:      z.number().nullable().optional(),
  image_url:      z.string().nullable().optional(),
  status:         z.enum(['draft', 'active', 'archived']).optional(),
});

export type VariantFormValues = z.infer<typeof variantSchema>;