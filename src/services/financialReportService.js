import apiClient from './api';

const BASE_URL = '/financial-reports';

export const financialReportService = {
    // Get profit & loss report
    getProfitLoss: async (params) => {
        const response = await apiClient.get(`${BASE_URL}/profit-loss`, { params });
        return response.data;
    },

    // Get expense trends
    getExpenseTrends: async (params) => {
        const response = await apiClient.get(`${BASE_URL}/expense-trends`, { params });
        return response.data;
    },

    // Get revenue trends
    getRevenueTrends: async (params) => {
        const response = await apiClient.get(`${BASE_URL}/revenue-trends`, { params });
        return response.data;
    },

    // Get category breakdown
    getCategoryBreakdown: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/category-breakdown`, { params });
        return response.data;
    },

    // Get financial summary (dashboard widget)
    getSummary: async () => {
        const response = await apiClient.get(`${BASE_URL}/summary`);
        return response.data;
    }
};

export default financialReportService;
