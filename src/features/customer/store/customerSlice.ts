import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { CustomerRepository } from '../../../infrastructure/repositories/CustomerRepository';
import type { CustomerState } from '../types/customer.types';
import type { CustomerFilters } from '../../../domain/repositories/ICustomerRepository';

const repo = new CustomerRepository();

export const fetchCustomersThunk = createAsyncThunk(
  'customers/fetchAll',
  async (filters: CustomerFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load customers');
    }
  },
);

export const deleteCustomerThunk = createAsyncThunk(
  'customers/delete',
  async (id: string, { rejectWithValue }) => {
    try { await repo.delete(id); return id; }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  },
);

const initialState: CustomerState = {
  items: [], total: 0, page: 1, limit: 10,
  totalPages: 0, isLoading: false, isSubmitting: false, error: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomerError(state)                             { state.error = null; },
    setCustomerPage(state, action: PayloadAction<number>) { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomersThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchCustomersThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchCustomersThunk.rejected,  (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(deleteCustomerThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(deleteCustomerThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting = false;
        state.items  = state.items.filter((c) => c.customer_id !== payload);
        state.total  = Math.max(0, state.total - 1);
      })
      .addCase(deleteCustomerThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearCustomerError, setCustomerPage } = customerSlice.actions;
export default customerSlice.reducer;