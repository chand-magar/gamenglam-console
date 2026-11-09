import axiosInstance from '../../core/api/axiosInstance';
import type { IInventoryRepository, InventoryFilters } from '../../domain/repositories/IInventoryRepository';
import type { InventoryItem } from '../../domain/entities/Inventory';
import type { ApiResponse } from '../../core/types/common.types';

export class InventoryRepository implements IInventoryRepository {
  async getAll(filters?: InventoryFilters) {
    const { data } = await axiosInstance.get<ApiResponse<any[]>>(
      '/product-variants',
      { params: { limit: 500 } },
    );

    let items: InventoryItem[] = Array.isArray(data.data)
      ? data.data.map((v: any) => ({
          variant_no:     v.variant_no,
          variant_id:     v.variant_id,
          product_no:     v.product_no      ?? 0,
          product_id:     v.product_id      ?? '',
          product_name:   v.product_name    ?? v.sku,
          category_no:    v.category_no     ?? 0,
          category_name:  v.category_name   ?? '—',
          image_url:      v.product_image_url ?? null, // ← product image
          sku:            v.sku,
          stock_qty:      v.stock_qty        ?? 0,
          cost_price:     v.cost_price       ?? 0,
          mrp:            v.mrp       ?? 0,
          selling_price:  v.selling_price       ?? 0,
          weight_kg:      v.weight_kg        ?? null,
          status:         v.status           ?? 'draft',
          updated_at:     v.updated_at       ?? '',
        }))
      : [];

    // Client-side filters
    if (filters?.stock_status === 'low') {
      items = items.filter((i) => i.stock_qty > 0 && i.stock_qty < 5);
    } else if (filters?.stock_status === 'out') {
      items = items.filter((i) => i.stock_qty === 0);
    }

    if (filters?.category_no) {
      items = items.filter((i) => i.category_no === filters.category_no);
    }

    const limit      = filters?.limit ?? 10;
    const page       = filters?.page  ?? 1;
    const totalPages = Math.ceil(items.length / limit);
    const paged      = items.slice((page - 1) * limit, page * limit);

    return { items: paged, total: items.length, page, limit, totalPages };
  }

  async updateStock(variantId: string, stockQty: number): Promise<void> {
    await axiosInstance.put(`/product-variants/${variantId}`, {
      stock_qty: stockQty,
    });
  }
}