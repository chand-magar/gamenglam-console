import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AttributeRepository } from '../../../infrastructure/repositories/AttributeRepository';
import type { AttributeState } from '../types/attribute.types';
import type {
  AttributeFilters,
  CreateAttributePayload,
  UpdateAttributePayload,
} from '../../../domain/repositories/IAttributeRepository';

const repo = new AttributeRepository();

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchAttributesThunk = createAsyncThunk(
  'attributes/fetchAll',
  async (filters: AttributeFilters = {}, { rejectWithValue }) => {
    try {
      return await repo.getAll(filters);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to load attributes',
      );
    }
  },
);

export const createAttributeThunk = createAsyncThunk(
  'attributes/create',
  async (payload: CreateAttributePayload, { rejectWithValue }) => {
    try {
      return await repo.create(payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to create attribute',
      );
    }
  },
);

export const updateAttributeThunk = createAsyncThunk(
  'attributes/update',
  async (
    { id, payload }: { id: string; payload: UpdateAttributePayload },
    { rejectWithValue },
  ) => {
    try {
      return await repo.update(id, payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to update attribute',
      );
    }
  },
);

export const deleteAttributeThunk = createAsyncThunk(
  'attributes/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await repo.delete(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to delete attribute',
      );
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: AttributeState = {
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

const attributeSlice = createSlice({
  name: 'attributes',
  initialState,
  reducers: {
    clearAttributeError(state) {
      state.error = null;
    },
    setAttributePage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetAttributes(state) {
      state.items      = [];
      state.total      = 0;
      state.page       = 1;
      state.totalPages = 0;
      state.error      = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All ─────────────────────────────────────────
      .addCase(fetchAttributesThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchAttributesThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchAttributesThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload as string;
        state.items     = [];
      })

      // ── Create ────────────────────────────────────────────
      .addCase(createAttributeThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(createAttributeThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          state.items.unshift(payload);
          state.total += 1;
        }
      })
      .addCase(createAttributeThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      })

      // ── Update ────────────────────────────────────────────
      .addCase(updateAttributeThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(updateAttributeThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((a) => a.attribute_no === payload.attribute_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateAttributeThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      })

      // ── Delete ────────────────────────────────────────────
      .addCase(deleteAttributeThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(deleteAttributeThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items        = state.items.filter((a) => a.attribute_id !== payload);
        state.total        = Math.max(0, state.total - 1);
      })
      .addCase(deleteAttributeThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      });
  },
});

export const { clearAttributeError, setAttributePage, resetAttributes } = attributeSlice.actions;
export default attributeSlice.reducer;