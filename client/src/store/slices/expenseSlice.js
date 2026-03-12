import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseService from '../../services/expenseService';
import expenseCategoryService from '../../services/expenseCategoryService';

// Async thunks for expenses
export const fetchExpenses = createAsyncThunk(
    'expense/fetchExpenses',
    async (params, { rejectWithValue }) => {
        try {
            const response = await expenseService.getAll(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
        }
    }
);

export const fetchExpenseById = createAsyncThunk(
    'expense/fetchExpenseById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await expenseService.getById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
        }
    }
);

export const createExpense = createAsyncThunk(
    'expense/createExpense',
    async (expenseData, { rejectWithValue }) => {
        try {
            const response = await expenseService.create(expenseData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
        }
    }
);

export const updateExpense = createAsyncThunk(
    'expense/updateExpense',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await expenseService.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
        }
    }
);

export const deleteExpense = createAsyncThunk(
    'expense/deleteExpense',
    async (id, { rejectWithValue }) => {
        try {
            await expenseService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
        }
    }
);

export const approveExpense = createAsyncThunk(
    'expense/approveExpense',
    async ({ id, approvalNotes }, { rejectWithValue }) => {
        try {
            const response = await expenseService.approve(id, approvalNotes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve expense');
        }
    }
);

export const rejectExpense = createAsyncThunk(
    'expense/rejectExpense',
    async ({ id, approvalNotes }, { rejectWithValue }) => {
        try {
            const response = await expenseService.reject(id, approvalNotes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject expense');
        }
    }
);

export const fetchExpenseStats = createAsyncThunk(
    'expense/fetchExpenseStats',
    async (params, { rejectWithValue }) => {
        try {
            const response = await expenseService.getStats(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense stats');
        }
    }
);

// Async thunks for categories
export const fetchExpenseCategories = createAsyncThunk(
    'expense/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await expenseCategoryService.getAll();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const createExpenseCategory = createAsyncThunk(
    'expense/createCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await expenseCategoryService.create(categoryData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateExpenseCategory = createAsyncThunk(
    'expense/updateCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await expenseCategoryService.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update category');
        }
    }
);

export const deleteExpenseCategory = createAsyncThunk(
    'expense/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await expenseCategoryService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
        }
    }
);

const initialState = {
    expenses: [],
    selectedExpense: null,
    categories: [],
    stats: null,
    pagination: null,
    loading: false,
    error: null
};

const expenseSlice = createSlice({
    name: 'expense',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedExpense: (state) => {
            state.selectedExpense = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch expenses
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.data || action.payload;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch expense by ID
            .addCase(fetchExpenseById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenseById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedExpense = action.payload;
            })
            .addCase(fetchExpenseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create expense
            .addCase(createExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses.unshift(action.payload);
            })
            .addCase(createExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update expense
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.expenses.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.expenses[index] = action.payload;
                }
                if (state.selectedExpense?._id === action.payload._id) {
                    state.selectedExpense = action.payload;
                }
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete expense
            .addCase(deleteExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = state.expenses.filter(e => e._id !== action.payload);
            })
            .addCase(deleteExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Approve expense
            .addCase(approveExpense.fulfilled, (state, action) => {
                const index = state.expenses.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.expenses[index] = action.payload;
                }
                if (state.selectedExpense?._id === action.payload._id) {
                    state.selectedExpense = action.payload;
                }
            })
            // Reject expense
            .addCase(rejectExpense.fulfilled, (state, action) => {
                const index = state.expenses.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.expenses[index] = action.payload;
                }
                if (state.selectedExpense?._id === action.payload._id) {
                    state.selectedExpense = action.payload;
                }
            })
            // Fetch expense stats
            .addCase(fetchExpenseStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Fetch categories
            .addCase(fetchExpenseCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Create category
            .addCase(createExpenseCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            // Update category
            .addCase(updateExpenseCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            // Delete category
            .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
            });
    }
});

export const { clearError, clearSelectedExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
