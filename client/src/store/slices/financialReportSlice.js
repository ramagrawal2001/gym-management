import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import financialReportService from '../../services/financialReportService';

// Async thunks
export const fetchProfitLossReport = createAsyncThunk(
    'financialReport/fetchProfitLoss',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financialReportService.getProfitLoss(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch P&L report');
        }
    }
);

export const fetchExpenseTrends = createAsyncThunk(
    'financialReport/fetchExpenseTrends',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financialReportService.getExpenseTrends(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense trends');
        }
    }
);

export const fetchRevenueTrends = createAsyncThunk(
    'financialReport/fetchRevenueTrends',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financialReportService.getRevenueTrends(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue trends');
        }
    }
);

export const fetchCategoryBreakdown = createAsyncThunk(
    'financialReport/fetchCategoryBreakdown',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financialReportService.getCategoryBreakdown(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch category breakdown');
        }
    }
);

export const fetchFinancialSummary = createAsyncThunk(
    'financialReport/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await financialReportService.getSummary();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial summary');
        }
    }
);

const initialState = {
    profitLoss: null,
    expenseTrends: [],
    revenueTrends: [],
    categoryBreakdown: [],
    summary: null,
    loading: false,
    error: null
};

const financialReportSlice = createSlice({
    name: 'financialReport',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch profit & loss
            .addCase(fetchProfitLossReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfitLossReport.fulfilled, (state, action) => {
                state.loading = false;
                state.profitLoss = action.payload;
            })
            .addCase(fetchProfitLossReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch expense trends
            .addCase(fetchExpenseTrends.fulfilled, (state, action) => {
                state.expenseTrends = action.payload;
            })
            // Fetch revenue trends
            .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
                state.revenueTrends = action.payload;
            })
            // Fetch category breakdown
            .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
                state.categoryBreakdown = action.payload;
            })
            // Fetch summary
            .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            });
    }
});

export const { clearError } = financialReportSlice.actions;
export default financialReportSlice.reducer;
