import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import type { CategoryState } from '../types/category.types';
import type {
  CategoryFilters,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../../domain/repositories/ICategoryRepository';

const repo = new CategoryRepository();

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCategoriesThunk = createAsyncThunk(
  'categories/fetchAll',
  async (filters: CategoryFilters = {}, { rejectWithValue }) => {
    try {
      return await repo.getAll(filters);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to load categories',
      );
    }
  },
);

export const fetchCategoryByIdThunk = createAsyncThunk(
  'categories/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await repo.getById(id);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to load category',
      );
    }
  },
);

export const createCategoryThunk = createAsyncThunk(
  'categories/create',
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      return await repo.create(payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to create category',
      );
    }
  },
);

export const updateCategoryThunk = createAsyncThunk(
  'categories/update',
  async (
    { id, payload }: { id: number; payload: UpdateCategoryPayload },
    { rejectWithValue },
  ) => {
    try {
      return await repo.update(id, payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to update category',
      );
    }
  },
);

export const deleteCategoryThunk = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await repo.delete(id);
      return id; // return deleted category_no for state removal
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to delete category',
      );
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: CategoryState = {
  items:        [],
  total:        0,
  page:         1,
  limit:        10,
  totalPages:   0,
  isLoading:    false,
  isSubmitting: false,
  error:        null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetCategories(state) {
      state.items      = [];
      state.total      = 0;
      state.page       = 1;
      state.totalPages = 0;
      state.error      = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Fetch All ───────────────────────────────────────
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload as string;
        state.items     = [];
      })

      // ── Fetch By ID ─────────────────────────────────────
      .addCase(fetchCategoryByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchCategoryByIdThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCategoryByIdThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload as string;
      })

      // ── Create ──────────────────────────────────────────
      .addCase(createCategoryThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(createCategoryThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          state.items.unshift(payload);
          state.total += 1;
        }
      })
      .addCase(createCategoryThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      })

      // ── Update ──────────────────────────────────────────
      .addCase(updateCategoryThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(updateCategoryThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex(
            (c) => c.category_no === payload.category_no,
          );
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateCategoryThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      })

      // ── Delete ──────────────────────────────────────────
      .addCase(deleteCategoryThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items        = state.items.filter(
          (c) => c.category_no !== payload,
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteCategoryThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      });
  },
});

// ── Exports ───────────────────────────────────────────────────────────────────

export const { clearError, setPage, resetCategories } = categorySlice.actions;
export default categorySlice.reducer;