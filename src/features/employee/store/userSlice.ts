import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import type { UserState } from '../types/user.types';
import type {
  UserFilters,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../../domain/repositories/IUserRepository';

const repo = new UserRepository();

export const fetchUsersThunk = createAsyncThunk(
  'users/fetchAll',
  async (filters: UserFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load users');
    }
  },
);

export const createUserThunk = createAsyncThunk(
  'users/create',
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try { return await repo.create(payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create user');
    }
  },
);

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async (
    { id, payload }: { id: string; payload: UpdateUserPayload },
    { rejectWithValue },
  ) => {
    try { return await repo.update(id, payload); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update user');
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete user');
    }
  },
);

const initialState: UserState = {
  items: [], total: 0, page: 1, limit: 10,
  totalPages: 0, isLoading: false, isSubmitting: false, error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError(state)                             { state.error = null; },
    setUserPage(state, action: PayloadAction<number>) { state.page = action.payload; },
    resetUsers(state) {
      state.items = []; state.total = 0; state.page = 1;
      state.totalPages = 0; state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchUsersThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchUsersThunk.rejected,  (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(createUserThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(createUserThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) { state.items.unshift(payload); state.total += 1; }
      })
      .addCase(createUserThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(updateUserThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateUserThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        if (payload) {
          const idx = state.items.findIndex((u) => u.profile_no === payload.profile_no);
          if (idx !== -1) state.items[idx] = payload;
        }
      })
      .addCase(updateUserThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      })

      .addCase(deleteUserThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(deleteUserThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((u) => u.profile_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteUserThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearUserError, setUserPage, resetUsers } = userSlice.actions;
export default userSlice.reducer;