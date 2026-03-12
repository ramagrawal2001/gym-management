import apiClient from './api';

const BASE_URL = '/expenses';

export const expenseService = {
    // Get all expenses with filters
    getAll: async (params = {}) => {
        const response = await apiClient.get(BASE_URL, { params });
        return response.data;
    },

    // Get single expense
    getById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Create expense
    create: async (expenseData) => {
        const response = await apiClient.post(BASE_URL, expenseData);
        return response.data;
    },

    // Update expense
    update: async (id, expenseData) => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, expenseData);
        return response.data;
    },

    // Delete expense
    delete: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Approve expense
    approve: async (id, approvalNotes) => {
        const response = await apiClient.post(`${BASE_URL}/${id}/approve`, { approvalNotes });
        return response.data;
    },

    // Reject expense
    reject: async (id, approvalNotes) => {
        const response = await apiClient.post(`${BASE_URL}/${id}/reject`, { approvalNotes });
        return response.data;
    },

    // Get expense statistics
    getStats: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/stats`, { params });
        return response.data;
    },

    // Export expenses to CSV
    export: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/export`, {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    // Import expenses from CSV
    import: async (expenses) => {
        const response = await apiClient.post(`${BASE_URL}/import`, { expenses });
        return response.data;
    }
};

export default expenseService;
