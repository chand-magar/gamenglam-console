import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AttributeValueRepository } from '../../../infrastructure/repositories/AttributeValueRepository';
import type { AttributeValueState } from '../types/attributeValue.types';
import type {
  AttributeValueFilters,
  CreateAttributeValuePayload,
  UpdateAttributeValuePayload,
} from '../../../domain/repositories/IAttributeValueRepository';

const repo = new AttributeValueRepository();

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchAttributeValuesThunk = createAsyncThunk(
  'attributeValues/fetchAll',
  async (
    { attributeId, filters }: { attributeId: string; filters?: AttributeValueFilters },
    { rejectWithValue },
  ) => {
    try {
      return await repo.getAll(attributeId, filters);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to load attribute values',
      );
    }
  },
);

export const createAttributeValueThunk = createAsyncThunk(
  'attributeValues/create',
  async (
    { attributeId, payload }: { attributeId: string; payload: CreateAttributeValuePayload },
    { rejectWithValue },
  ) => {
    try {
      return await repo.create(attributeId, payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to create value',
      );
    }
  },
);

export const updateAttributeValueThunk = createAsyncThunk(
  'attributeValues/update',
  async (
    { id, payload }: { id: string; payload: UpdateAttributeValuePayload },
    { rejectWithValue },
  ) => {
    try {
      return await repo.update(id, payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to update value',
      );
    }
  },
);

export const deleteAttributeValueThunk = createAsyncThunk(
  'attributeValues/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await repo.delete(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to delete value',
      );
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: AttributeValueState = {
  items:        [],
  total:        0,
  isLoading:    false,
  isSubmitting: false,
  error:        null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const attributeValueSlice = createSlice({
  name: 'attributeValues',
  initialState,
  reducers: {
    clearAttributeValueError(state) {
      state.error = null;
    },
    resetAttributeValues(state) {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All ─────────────────────────────────────────
      .addCase(fetchAttributeValuesThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchAttributeValuesThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.items     = Array.isArray(payload?.items) ? payload.items : [];
        state.total     = payload?.total ?? 0;
      })
      .addCase(fetchAttributeValuesThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload as string;
        state.items     = [];
      })

      // ── Create ────────────────────────────────────────────
      .addCase(createAttributeValueThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(createAttributeValueThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          state.items.push(payload);
          state.total += 1;
        }
      })
      .addCase(createAttributeValueThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      })

      // ── Update ────────────────────────────────────────────
      .addCase(updateAttributeValueThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(updateAttributeValueThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex(
            (v) => v.attribute_value_no === payload.attribute_value_no,
          );
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateAttributeValueThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      })

      // ── Delete ────────────────────────────────────────────
      .addCase(deleteAttributeValueThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(deleteAttributeValueThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items        = state.items.filter((v) => v.attribute_value_id !== payload);
        state.total        = Math.max(0, state.total - 1);
      })
      .addCase(deleteAttributeValueThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false;
        state.error        = payload as string;
      });
  },
});

export const {
  clearAttributeValueError,
  resetAttributeValues,
} = attributeValueSlice.actions;
export default attributeValueSlice.reducer;