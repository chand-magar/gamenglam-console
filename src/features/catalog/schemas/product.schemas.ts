import { z } from 'zod';

export const specItemSchema = z.object({
  key:   z.string().min(1),
  value: z.string().min(1),
});

export const productSchema = z.object({
  category_id:    z.string().min(1, 'Category is required'), // ← UUID string
  sku:            z.string().min(2).max(100),
  product_name:   z.string().min(2).max(255),
  slug:           z.string().min(2).max(255),
  description:    z.string().optional(),
  is_featured:    z.boolean(),
  status:         z.enum(['draft', 'active', 'archived']),
  features:       z.array(z.string()).optional().default([]),
  specifications: z.array(specItemSchema).optional().default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  sku:           z.string().min(2).max(100),
  cost_price:    z.number().nullable().optional(),    // ← add
  mrp:           z.number().nullable().optional(),    // ← add
  selling_price: z.number().nullable().optional(),    // ← add
  stock_qty:     z.number().min(0),
  weight_kg:     z.number().nullable().optional(),
  image_url:     z.string().nullable().optional(),
  status:        z.enum(['draft', 'active', 'archived']).optional(),
});

export type VariantFormValues = z.infer<typeof variantSchema>;