import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { CouponRepository } from '../../../infrastructure/repositories/CouponRepository';
import type { CouponState } from '../types/coupon.types';
import type {
  CouponFilters,
  CreateCouponPayload,
  UpdateCouponPayload,
} from '../../../domain/repositories/ICouponRepository';

const repo = new CouponRepository();

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchCouponsThunk = createAsyncThunk(
  'coupons/fetchAll',
  async (filters: CouponFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) { return rejectWithValue(err instanceof Error ? err.message : 'Failed to load coupons'); }
  },
);

export const createCouponThunk = createAsyncThunk(
  'coupons/create',
  async (payload: CreateCouponPayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) { return rejectWithValue(err instanceof Error ? err.message : 'Failed to create coupon'); }
  },
);

export const updateCouponThunk = createAsyncThunk(
  'coupons/update',
  async ({ id, payload }: { id: string; payload: UpdateCouponPayload }, { rejectWithValue }) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) { return rejectWithValue(err instanceof Error ? err.message : 'Failed to update coupon'); }
  },
);

export const deleteCouponThunk = createAsyncThunk(
  'coupons/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) { return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete coupon'); }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: CouponState = {
  items: [], total: 0, page: 1, limit: 10, totalPages: 0,
  isLoading: false, isSubmitting: false, error: null,
};

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    setPage(state, action: PayloadAction<number>) { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCouponsThunk.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchCouponsThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchCouponsThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload as string; state.items = []; })

      .addCase(createCouponThunk.pending,   (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(createCouponThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) { state.items.unshift(payload); state.total += 1; }
      })
      .addCase(createCouponThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; })

      .addCase(updateCouponThunk.pending,   (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(updateCouponThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((c) => c.coupon_id === payload.coupon_id);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateCouponThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; })

      .addCase(deleteCouponThunk.pending,   (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(deleteCouponThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((c) => c.coupon_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteCouponThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; });
  },
});

export const { clearError, setPage } = couponSlice.actions;
export default couponSlice.reducer;
