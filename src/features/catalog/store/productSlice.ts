import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';
import type { ProductState } from '../types/product.types';
import type {
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from '../../../domain/repositories/IProductRepository';

const repo = new ProductRepository();

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchAll',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load products');
    }
  },
);

export const createProductThunk = createAsyncThunk(
  'products/create',
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create product');
    }
  },
);

export const updateProductThunk = createAsyncThunk(
  'products/update',
  async ({ id, payload }: { id: string; payload: UpdateProductPayload }, { rejectWithValue }) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update product');
    }
  },
);

export const deleteProductThunk = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete product');
    }
  },
);

const initialState: ProductState = {
  items: [], total: 0, page: 1, limit: 10, totalPages: 0,
  isLoading: false, isSubmitting: false, error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError(state)                          { state.error = null; },
    setProductPage(state, action: PayloadAction<number>) { state.page = action.payload; },
    resetProducts(state) {
      state.items = []; state.total = 0; state.page = 1;
      state.totalPages = 0; state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending,  (state)           => { state.isLoading = true;  state.error = null; })
      .addCase(fetchProductsThunk.fulfilled,(state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchProductsThunk.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload as string; state.items = []; })

      .addCase(createProductThunk.pending,  (state)           => { state.isSubmitting = true;  state.error = null; })
      .addCase(createProductThunk.fulfilled,(state, { payload }) => {
        state.isSubmitting = false;
        if (payload) { state.items.unshift(payload); state.total += 1; }
      })
      .addCase(createProductThunk.rejected, (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; })

      .addCase(updateProductThunk.pending,  (state)           => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateProductThunk.fulfilled,(state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((p) => p.product_no === payload.product_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateProductThunk.rejected, (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; })

      .addCase(deleteProductThunk.pending,  (state)           => { state.isSubmitting = true;  state.error = null; })
      .addCase(deleteProductThunk.fulfilled,(state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((p) => p.product_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteProductThunk.rejected, (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; });
  },
});

export const { clearProductError, setProductPage, resetProducts } = productSlice.actions;
export default productSlice.reducer;