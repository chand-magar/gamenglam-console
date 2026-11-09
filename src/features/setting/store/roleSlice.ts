import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RoleRepository } from '../../../infrastructure/repositories/RoleRepository';
import type { RoleState } from '../types/role.types';
import type {
  RoleFilters,
  CreateRolePayload,
  UpdateRolePayload,
} from '../../../domain/repositories/IRoleRepository';

const repo = new RoleRepository();

export const fetchRolesThunk = createAsyncThunk(
  'roles/fetchAll',
  async (filters: RoleFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load roles');
    }
  },
);

export const createRoleThunk = createAsyncThunk(
  'roles/create',
  async (payload: CreateRolePayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create role');
    }
  },
);

export const updateRoleThunk = createAsyncThunk(
  'roles/update',
  async (
    { id, payload }: { id: string; payload: UpdateRolePayload },
    { rejectWithValue },
  ) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update role');
    }
  },
);

export const deleteRoleThunk = createAsyncThunk(
  'roles/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete role');
    }
  },
);

const initialState: RoleState = {
  items: [], total: 0, page: 1, limit: 10,
  totalPages: 0, isLoading: false, isSubmitting: false, error: null,
};

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearRoleError(state)                             { state.error = null; },
    setRolePage(state, action: PayloadAction<number>) { state.page = action.payload; },
    resetRoles(state) {
      state.items = []; state.total = 0; state.page = 1;
      state.totalPages = 0; state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchRolesThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchRolesThunk.rejected,  (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(createRoleThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(createRoleThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) { state.items.unshift(payload); state.total += 1; }
      })
      .addCase(createRoleThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(updateRoleThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateRoleThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((r) => r.role_no === payload.role_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateRoleThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(deleteRoleThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(deleteRoleThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((r) => r.role_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteRoleThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearRoleError, setRolePage, resetRoles } = roleSlice.actions;
export default roleSlice.reducer;