import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductVariantRepository } from '../../../infrastructure/repositories/ProductVariantRepository';
import type { ProductVariantState } from '../types/product.types';
import type {
  CreateVariantPayload,
  UpdateVariantPayload,
} from '../../../domain/repositories/IProductRepository';

const repo = new ProductVariantRepository();

export const fetchVariantsThunk = createAsyncThunk(
  'productVariants/fetchAll',
  async (productId: string, { rejectWithValue }) => {
    try { return await repo.getAllByProduct(productId); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load variants');
    }
  },
);

export const createVariantThunk = createAsyncThunk(
  'productVariants/create',
  async (payload: CreateVariantPayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create variant');
    }
  },
);

export const updateVariantThunk = createAsyncThunk(
  'productVariants/update',
  async ({ id, payload }: { id: string; payload: UpdateVariantPayload }, { rejectWithValue }) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update variant');
    }
  },
);

export const deleteVariantThunk = createAsyncThunk(
  'productVariants/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete variant');
    }
  },
);

const initialState: ProductVariantState = {
  items: [], isLoading: false, isSubmitting: false, error: null,
};

const productVariantSlice = createSlice({
  name: 'productVariants',
  initialState,
  reducers: {
    clearVariantError(state) { state.error = null; },
    resetVariants(state)     { state.items = []; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVariantsThunk.pending,   (state)           => { state.isLoading = true;  state.error = null; })
      .addCase(fetchVariantsThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.items     = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchVariantsThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload as string; })

      .addCase(createVariantThunk.pending,   (state)           => { state.isSubmitting = true;  state.error = null; })
      .addCase(createVariantThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) state.items.push(payload);
      })
      .addCase(createVariantThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; })

      .addCase(updateVariantThunk.pending,   (state)           => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateVariantThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((v) => v.variant_no === payload.variant_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateVariantThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; })

      .addCase(deleteVariantThunk.pending,   (state)           => { state.isSubmitting = true;  state.error = null; })
      .addCase(deleteVariantThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items = state.items.filter((v) => v.variant_id !== payload);
      })
      .addCase(deleteVariantThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; });
  },
});

export const { clearVariantError, resetVariants } = productVariantSlice.actions;
export default productVariantSlice.reducer;