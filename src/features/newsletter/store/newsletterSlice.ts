import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NewsletterRepository } from '../../../infrastructure/repositories/NewsletterRepository';
import type { NewsletterState } from '../types/newsletter.types';
import type {
  SubscriberFilters,
  AddSubscriberPayload,
  SendCampaignPayload,
} from '../../../domain/repositories/INewsletterRepository';

const repo = new NewsletterRepository();

// ── Thunks ─────────────────────────────────────────────────────────────────

export const fetchSubscribersThunk = createAsyncThunk(
  'newsletter/fetchSubscribers',
  async (filters: SubscriberFilters = {}, { rejectWithValue }) => {
    try { return await repo.getSubscribers(filters); }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to load subscribers'); }
  },
);

export const addSubscriberThunk = createAsyncThunk(
  'newsletter/addSubscriber',
  async (payload: AddSubscriberPayload, { rejectWithValue }) => {
    try { return await repo.addSubscriber(payload); }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to add subscriber'); }
  },
);

export const deleteSubscriberThunk = createAsyncThunk(
  'newsletter/deleteSubscriber',
  async (id: string, { rejectWithValue }) => {
    try { await repo.deleteSubscriber(id); return id; }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to remove subscriber'); }
  },
);

export const fetchCampaignsThunk = createAsyncThunk(
  'newsletter/fetchCampaigns',
  async ({ page, limit }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await repo.getCampaigns(page, limit); }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to load campaigns'); }
  },
);

export const sendCampaignThunk = createAsyncThunk(
  'newsletter/sendCampaign',
  async (payload: SendCampaignPayload, { rejectWithValue }) => {
    try { return await repo.sendCampaign(payload); }
    catch (e: unknown) { return rejectWithValue(e instanceof Error ? e.message : 'Failed to send campaign'); }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────

const initialState: NewsletterState = {
  subscribers: [], subscriberTotal: 0, subscriberPage: 1, subscriberLimit: 10, subscriberPages: 0,
  campaigns:   [], campaignTotal:   0, campaignPage:   1, campaignPages:   0,
  isLoading: false, isSubmitting: false, isSending: false, error: null,
};

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetch subscribers
      .addCase(fetchSubscribersThunk.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchSubscribersThunk.fulfilled, (s, { payload }) => {
        s.isLoading        = false;
        s.subscribers      = Array.isArray(payload?.items) ? payload.items : [];
        s.subscriberTotal  = payload?.total      ?? 0;
        s.subscriberPage   = payload?.page       ?? 1;
        s.subscriberLimit  = payload?.limit      ?? 10;
        s.subscriberPages  = payload?.totalPages ?? 0;
      })
      .addCase(fetchSubscribersThunk.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload as string; })

      // add subscriber
      .addCase(addSubscriberThunk.pending,   (s) => { s.isSubmitting = true; s.error = null; })
      .addCase(addSubscriberThunk.fulfilled, (s, { payload }) => {
        s.isSubmitting = false;
        if (payload) { s.subscribers.unshift(payload); s.subscriberTotal += 1; }
      })
      .addCase(addSubscriberThunk.rejected,  (s, { payload }) => { s.isSubmitting = false; s.error = payload as string; })

      // delete subscriber
      .addCase(deleteSubscriberThunk.pending,   (s) => { s.isSubmitting = true; s.error = null; })
      .addCase(deleteSubscriberThunk.fulfilled, (s, { payload }) => {
        s.isSubmitting = false;
        s.subscribers  = s.subscribers.filter((sub) => sub.subscriber_id !== payload);
        s.subscriberTotal = Math.max(0, s.subscriberTotal - 1);
      })
      .addCase(deleteSubscriberThunk.rejected,  (s, { payload }) => { s.isSubmitting = false; s.error = payload as string; })

      // fetch campaigns
      .addCase(fetchCampaignsThunk.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchCampaignsThunk.fulfilled, (s, { payload }) => {
        s.isLoading     = false;
        s.campaigns     = Array.isArray(payload?.items) ? payload.items : [];
        s.campaignTotal = payload?.total      ?? 0;
        s.campaignPage  = payload?.page       ?? 1;
        s.campaignPages = payload?.totalPages ?? 0;
      })
      .addCase(fetchCampaignsThunk.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload as string; })

      // send campaign
      .addCase(sendCampaignThunk.pending,   (s) => { s.isSending = true; s.error = null; })
      .addCase(sendCampaignThunk.fulfilled, (s, { payload }) => {
        s.isSending = false;
        if (payload) { s.campaigns.unshift(payload); s.campaignTotal += 1; }
      })
      .addCase(sendCampaignThunk.rejected,  (s, { payload }) => { s.isSending = false; s.error = payload as string; });
  },
});

export const { clearError } = newsletterSlice.actions;
export default newsletterSlice.reducer;
