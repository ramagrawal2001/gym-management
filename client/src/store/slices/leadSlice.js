import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as leadService from '../../services/leadService';

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params, { rejectWithValue }) => {
    try {
      const response = await leadService.getLeads(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ leadId, status, memberId }, { rejectWithValue }) => {
    try {
      const response = await leadService.updateLeadStatus(leadId, status, memberId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead status');
    }
  }
);

const initialState = {
  leads: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  isLoading: false,
  error: null
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    updateLeadInList: (state, action) => {
      const lead = action.payload.data || action.payload;
      const index = state.leads.findIndex(l => (l._id === lead._id) || (l.id === lead.id));
      if (index !== -1) {
        state.leads[index] = { ...state.leads[index], ...lead };
      } else {
        state.leads.push(lead);
      }
    },
    removeLeadFromList: (state, action) => {
      state.leads = state.leads.filter(l => l._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.leads = payload.data?.leads || payload.leads || payload.data || payload || [];
        if (payload.meta?.pagination) {
          state.pagination = payload.meta.pagination;
        } else if (payload.pagination) {
          state.pagination = payload.pagination;
        } else if (payload.page) {
          state.pagination = {
            page: payload.page,
            limit: payload.limit || 10,
            total: payload.total || 0,
            pages: payload.pages || 0
          };
        }
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      });
  }
});

export const { updateLeadInList, removeLeadFromList } = leadSlice.actions;
export default leadSlice.reducer;

