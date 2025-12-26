import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import revenueService from '../../services/revenueService';

// Async thunks
export const fetchRevenues = createAsyncThunk(
    'revenue/fetchRevenues',
    async (params, { rejectWithValue }) => {
        try {
            const response = await revenueService.getAll(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenues');
        }
    }
);

export const fetchRevenueById = createAsyncThunk(
    'revenue/fetchRevenueById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await revenueService.getById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue');
        }
    }
);

export const createRevenue = createAsyncThunk(
    'revenue/createRevenue',
    async (revenueData, { rejectWithValue }) => {
        try {
            const response = await revenueService.create(revenueData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create revenue');
        }
    }
);

export const updateRevenue = createAsyncThunk(
    'revenue/updateRevenue',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await revenueService.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update revenue');
        }
    }
);

export const deleteRevenue = createAsyncThunk(
    'revenue/deleteRevenue',
    async (id, { rejectWithValue }) => {
        try {
            await revenueService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete revenue');
        }
    }
);

export const fetchRevenueStats = createAsyncThunk(
    'revenue/fetchRevenueStats',
    async (params, { rejectWithValue }) => {
        try {
            const response = await revenueService.getStats(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue stats');
        }
    }
);

const initialState = {
    revenues: [],
    selectedRevenue: null,
    stats: null,
    pagination: null,
    loading: false,
    error: null
};

const revenueSlice = createSlice({
    name: 'revenue',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedRevenue: (state) => {
            state.selectedRevenue = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch revenues
            .addCase(fetchRevenues.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenues.fulfilled, (state, action) => {
                state.loading = false;
                state.revenues = action.payload.data || action.payload;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchRevenues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch revenue by ID
            .addCase(fetchRevenueById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRevenue = action.payload;
            })
            .addCase(fetchRevenueById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create revenue
            .addCase(createRevenue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRevenue.fulfilled, (state, action) => {
                state.loading = false;
                state.revenues.unshift(action.payload);
            })
            .addCase(createRevenue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update revenue
            .addCase(updateRevenue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRevenue.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.revenues.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.revenues[index] = action.payload;
                }
                if (state.selectedRevenue?._id === action.payload._id) {
                    state.selectedRevenue = action.payload;
                }
            })
            .addCase(updateRevenue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete revenue
            .addCase(deleteRevenue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRevenue.fulfilled, (state, action) => {
                state.loading = false;
                state.revenues = state.revenues.filter(r => r._id !== action.payload);
            })
            .addCase(deleteRevenue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch stats
            .addCase(fetchRevenueStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    }
});

export const { clearError, clearSelectedRevenue } = revenueSlice.actions;
export default revenueSlice.reducer;
