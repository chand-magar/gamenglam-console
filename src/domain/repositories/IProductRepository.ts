import type { Product, ProductVariant } from '../entities/Product';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface ProductFilters {
  page?:        number;
  limit?:       number;
  status?:      string;
  category_no?: number;
  is_featured?: boolean;
  search?:      string;
}

export interface CreateProductPayload {
  category_no:  number;
  sku:          string;
  product_name: string;
  slug:         string;
  description?: string;
  base_price:   number;
  is_featured:  boolean;
  stock_qty:    number;
}

export interface UpdateProductPayload {
  category_no?:  number;
  sku?:          string;
  product_name?: string;
  slug?:         string;
  description?:  string;
  base_price?:   number;
  is_featured?:  boolean;
  stock_qty?:    number;
  status?:       string;
}

export interface CreateVariantPayload {
  product_no:     number;
  sku:            string;
  price_override?: number | null;
  stock_qty:      number;
  weight_kg?:     number | null;
  image_url?:     string | null;
}

export interface UpdateVariantPayload {
  sku?:            string;
  price_override?: number | null;
  stock_qty?:      number;
  weight_kg?:      number | null;
  image_url?:      string | null;
  status?:         string;
}

export interface IProductRepository {
  getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>>;
  getById(id: string): Promise<Product>;
  create(payload: CreateProductPayload): Promise<Product>;
  update(id: string, payload: UpdateProductPayload): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface IProductVariantRepository {
  getAllByProduct(productId: string): Promise<ProductVariant[]>;
  getById(id: string): Promise<ProductVariant>;
  create(payload: CreateVariantPayload): Promise<ProductVariant>;
  update(id: string, payload: UpdateVariantPayload): Promise<ProductVariant>;
  delete(id: string): Promise<void>;
}