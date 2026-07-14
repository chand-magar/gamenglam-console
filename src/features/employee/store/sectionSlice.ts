import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SectionRepository } from '../../../infrastructure/repositories/SectionRepository';
import type { SectionState } from '../types/section.types';
import type {
  SectionFilters,
  CreateSectionPayload,
  UpdateSectionPayload,
} from '../../../domain/repositories/ISectionRepository';

const repo = new SectionRepository();

export const fetchSectionsThunk = createAsyncThunk(
  'sections/fetchAll',
  async (filters: SectionFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load sections');
    }
  },
);

export const createSectionThunk = createAsyncThunk(
  'sections/create',
  async (payload: CreateSectionPayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create section');
    }
  },
);

export const updateSectionThunk = createAsyncThunk(
  'sections/update',
  async ({ id, payload }: { id: string; payload: UpdateSectionPayload }, { rejectWithValue }) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update section');
    }
  },
);

export const deleteSectionThunk = createAsyncThunk(
  'sections/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete section');
    }
  },
);

const initialState: SectionState = {
  items: [], total: 0, page: 1, limit: 10,
  totalPages: 0, isLoading: false, isSubmitting: false, error: null,
};

const sectionSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    clearSectionError(state)                             { state.error = null; },
    setSectionPage(state, action: PayloadAction<number>) { state.page = action.payload; },
    resetSections(state) {
      state.items = []; state.total = 0; state.page = 1;
      state.totalPages = 0; state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectionsThunk.pending,  (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchSectionsThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchSectionsThunk.rejected, (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(createSectionThunk.pending,  (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(createSectionThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) { state.items.unshift(payload); state.total += 1; }
      })
      .addCase(createSectionThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(updateSectionThunk.pending,  (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateSectionThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((s) => s.section_no === payload.section_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateSectionThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(deleteSectionThunk.pending,  (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(deleteSectionThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((s) => s.section_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteSectionThunk.rejected, (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearSectionError, setSectionPage, resetSections } = sectionSlice.actions;
export default sectionSlice.reducer;