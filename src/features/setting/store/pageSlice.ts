import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { PageRepository } from '../../../infrastructure/repositories/PageRepository';
import type { PageState } from '../types/page.types';
import type {
  PageFilters,
  CreatePagePayload,
  UpdatePagePayload,
} from '../../../domain/repositories/IPageRepository';

const repo = new PageRepository();

export const fetchPagesThunk = createAsyncThunk(
  'pages/fetchAll',
  async (filters: PageFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load pages');
    }
  },
);

export const createPageThunk = createAsyncThunk(
  'pages/create',
  async (payload: CreatePagePayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create page');
    }
  },
);

export const updatePageThunk = createAsyncThunk(
  'pages/update',
  async (
    { id, payload }: { id: string; payload: UpdatePagePayload },
    { rejectWithValue },
  ) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update page');
    }
  },
);

export const deletePageThunk = createAsyncThunk(
  'pages/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete page');
    }
  },
);

const initialState: PageState = {
  items: [], total: 0, page: 1, limit: 10,
  totalPages: 0, isLoading: false, isSubmitting: false, error: null,
};

const pageSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    clearPageError(state)                             { state.error = null; },
    setPagePage(state, action: PayloadAction<number>) { state.page = action.payload; },
    resetPages(state) {
      state.items = []; state.total = 0; state.page = 1;
      state.totalPages = 0; state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPagesThunk.pending,    (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchPagesThunk.fulfilled,  (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchPagesThunk.rejected,   (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(createPageThunk.pending,    (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(createPageThunk.fulfilled,  (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) { state.items.unshift(payload); state.total += 1; }
      })
      .addCase(createPageThunk.rejected,   (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(updatePageThunk.pending,    (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(updatePageThunk.fulfilled,  (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((p) => p.page_no === payload.page_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updatePageThunk.rejected,   (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(deletePageThunk.pending,    (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(deletePageThunk.fulfilled,  (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((p) => p.page_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deletePageThunk.rejected,   (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearPageError, setPagePage, resetPages } = pageSlice.actions;
export default pageSlice.reducer;