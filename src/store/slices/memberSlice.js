import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as memberService from '../../services/memberService';

// Async thunks
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await memberService.getMembers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

export const fetchMember = createAsyncThunk(
  'members/fetchMember',
  async (memberId, { rejectWithValue }) => {
    try {
      const response = await memberService.getMember(memberId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch member');
    }
  }
);

const initialState = {
  members: [],
  currentMember: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  isLoading: false,
  error: null
};

const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
    updateMemberInList: (state, action) => {
      const index = state.members.findIndex(m => m._id === action.payload._id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    removeMemberFromList: (state, action) => {
      state.members = state.members.filter(m => m._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        state.members = payload.data?.members || payload.members || payload.data || payload || [];
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
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentMember, updateMemberInList, removeMemberFromList } = memberSlice.actions;
export default memberSlice.reducer;

