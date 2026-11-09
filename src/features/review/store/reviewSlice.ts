import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ReviewRepository } from '../../../infrastructure/repositories/ReviewRepository';
import type { ReviewState } from '../types/review.types';
import type { ReviewFilters } from '../../../domain/repositories/IReviewRepository';

const repo = new ReviewRepository();

export const fetchReviewsThunk = createAsyncThunk(
  'reviews/fetchAll',
  async (filters: ReviewFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) { return rejectWithValue(err instanceof Error ? err.message : 'Failed to load reviews'); }
  },
);

export const deleteReviewThunk = createAsyncThunk(
  'reviews/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) { return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete review'); }
  },
);

const initialState: ReviewState = {
  items: [], total: 0, page: 1, limit: 10, totalPages: 0,
  isLoading: false, isSubmitting: false, error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    setPage(state, action: PayloadAction<number>) { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsThunk.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchReviewsThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchReviewsThunk.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload as string; state.items = []; })

      .addCase(deleteReviewThunk.pending,   (state) => { state.isSubmitting = true; state.error = null; })
      .addCase(deleteReviewThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((r) => r.review_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteReviewThunk.rejected,  (state, { payload }) => { state.isSubmitting = false; state.error = payload as string; });
  },
});

export const { clearError, setPage } = reviewSlice.actions;
export default reviewSlice.reducer;
