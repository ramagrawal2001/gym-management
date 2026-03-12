import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as gymService from '../../services/gymService';

// Async thunks
export const getGym = createAsyncThunk(
  'gym/getGym',
  async (gymId, { rejectWithValue }) => {
    try {
      const response = await gymService.getGym(gymId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get gym');
    }
  }
);

export const updateGym = createAsyncThunk(
  'gym/updateGym',
  async ({ gymId, data }, { rejectWithValue }) => {
    try {
      const response = await gymService.updateGym(gymId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update gym');
    }
  }
);

export const updateGymFeatures = createAsyncThunk(
  'gym/updateGymFeatures',
  async ({ gymId, features }, { rejectWithValue }) => {
    try {
      const response = await gymService.updateGymFeatures(gymId, features);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update features');
    }
  }
);

export const updateGymBranding = createAsyncThunk(
  'gym/updateGymBranding',
  async ({ gymId, branding }, { rejectWithValue }) => {
    try {
      const response = await gymService.updateGymBranding(gymId, branding);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update branding');
    }
  }
);

const initialState = {
  currentGym: null,
  features: {},
  branding: {},
  isLoading: false,
  error: null
};

const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    setGym: (state, action) => {
      state.currentGym = action.payload;
      if (action.payload) {
        state.features = action.payload.features || {};
        state.branding = action.payload.branding || {};
      }
    },
    clearGym: (state) => {
      state.currentGym = null;
      state.features = {};
      state.branding = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGym.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGym.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGym = action.payload;
        state.features = action.payload.features || {};
        state.branding = action.payload.branding || {};
      })
      .addCase(getGym.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateGym.fulfilled, (state, action) => {
        state.currentGym = action.payload;
      })
      .addCase(updateGymFeatures.fulfilled, (state, action) => {
        state.currentGym = action.payload;
        state.features = action.payload.features || {};
      })
      .addCase(updateGymBranding.fulfilled, (state, action) => {
        state.currentGym = action.payload;
        state.branding = action.payload.branding || {};
      });
  }
});

export const { setGym, clearGym } = gymSlice.actions;
export default gymSlice.reducer;

