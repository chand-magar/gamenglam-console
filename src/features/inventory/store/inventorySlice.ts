import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { InventoryRepository } from '../../../infrastructure/repositories/InventoryRepository';
import type { InventoryState } from '../types/inventory.types';
import type { InventoryFilters } from '../../../domain/repositories/IInventoryRepository';

const repo = new InventoryRepository();

export const fetchInventoryThunk = createAsyncThunk(
  'inventory/fetchAll',
  async (filters: InventoryFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load inventory');
    }
  },
);

export const updateStockThunk = createAsyncThunk(
  'inventory/updateStock',
  async ({ variantId, stockQty }: { variantId: string; stockQty: number }, { rejectWithValue }) => {
    try {
      await repo.updateStock(variantId, stockQty);
      return { variantId, stockQty };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update stock');
    }
  },
);

const initialState: InventoryState = {
  items: [], total: 0, page: 1, limit: 10,
  totalPages: 0, isLoading: false, isSubmitting: false, error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError(state)                             { state.error = null; },
    setInventoryPage(state, action: PayloadAction<number>) { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchInventoryThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchInventoryThunk.rejected,  (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(updateStockThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateStockThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        const idx = state.items.findIndex((i: any) => i.variant_id === payload.variantId);
        if (idx !== -1) state.items[idx].stock_qty = payload.stockQty;
      })
      .addCase(updateStockThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearInventoryError, setInventoryPage } = inventorySlice.actions;
export default inventorySlice.reducer;