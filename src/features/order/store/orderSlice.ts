import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { OrderRepository } from '../../../infrastructure/repositories/OrderRepository';
import type { OrderState } from '../types/order.types';
import type { OrderFilters, UpdateOrderStatusPayload } from '../../../domain/repositories/IOrderRepository';

const repo = new OrderRepository();

export const fetchOrdersThunk = createAsyncThunk(
  'orders/fetchAll',
  async (filters: OrderFilters = {}, { rejectWithValue }) => {
    try { return await repo.getAll(filters); }
    catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load orders');
    }
  },
);

export const fetchOrderDetailThunk = createAsyncThunk(
  'orders/fetchDetail',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const [order, history] = await Promise.all([
        repo.getById(orderId),
        repo.getHistory(orderId),
      ]);
      return { order, history };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load order');
    }
  },
);

export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async (
    { orderId, payload }: { orderId: string; payload: UpdateOrderStatusPayload },
    { rejectWithValue },
  ) => {
    try {
      const order   = await repo.updateStatus(orderId, payload);
      const history = await repo.getHistory(orderId);
      return { order, history };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update status');
    }
  },
);

const initialState: OrderState = {
  items:           [],
  total:           0,
  page:            1,
  limit:           10,
  totalPages:      0,
  selectedOrder:   null,
  orderHistory:    [],
  isLoading:       false,
  isDetailLoading: false,
  isSubmitting:    false,
  error:           null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError(state)                { state.error = null; },
    clearSelectedOrder(state)             { state.selectedOrder = null; state.orderHistory = []; },
    setOrderPage(state, action: PayloadAction<number>) { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchOrdersThunk.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.items      = Array.isArray(payload?.items) ? payload.items : [];
        state.total      = payload?.total      ?? 0;
        state.page       = payload?.page       ?? 1;
        state.limit      = payload?.limit      ?? 10;
        state.totalPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchOrdersThunk.rejected,  (state, { payload }) => {
        state.isLoading = false; state.error = payload as string; state.items = [];
      })

      .addCase(fetchOrderDetailThunk.pending,   (state) => { state.isDetailLoading = true; state.error = null; })
      .addCase(fetchOrderDetailThunk.fulfilled, (state, { payload }) => {
        state.isDetailLoading = false;
        state.selectedOrder   = payload.order;
        state.orderHistory    = payload.history;
      })
      .addCase(fetchOrderDetailThunk.rejected,  (state, { payload }) => {
        state.isDetailLoading = false; state.error = payload as string;
      })

      .addCase(updateOrderStatusThunk.pending,   (state) => { state.isSubmitting = true;  state.error = null; })
      .addCase(updateOrderStatusThunk.fulfilled, (state, { payload }) => {
        state.isSubmitting  = false;
        // UpdateStatus returns the order header only (no items) — preserve the already-loaded items
        state.selectedOrder = { ...payload.order, items: state.selectedOrder?.items ?? [] };
        state.orderHistory  = payload.history;
        const idx = state.items.findIndex((o) => o.order_id === payload.order.order_id);
        if (idx !== -1) state.items[idx] = payload.order;
      })
      .addCase(updateOrderStatusThunk.rejected,  (state, { payload }) => {
        state.isSubmitting = false; state.error = payload as string;
      });
  },
});

export const { clearOrderError, clearSelectedOrder, setOrderPage } = orderSlice.actions;
export default orderSlice.reducer;