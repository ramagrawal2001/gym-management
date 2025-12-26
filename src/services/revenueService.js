import apiClient from './api';

const BASE_URL = '/revenues';

export const revenueService = {
    // Get all revenues with filters
    getAll: async (params = {}) => {
        const response = await apiClient.get(BASE_URL, { params });
        return response.data;
    },

    // Get single revenue
    getById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Create revenue
    create: async (revenueData) => {
        const response = await apiClient.post(BASE_URL, revenueData);
        return response.data;
    },

    // Update revenue
    update: async (id, revenueData) => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, revenueData);
        return response.data;
    },

    // Delete revenue
    delete: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Get revenue statistics
    getStats: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/stats`, { params });
        return response.data;
    }
};

export default revenueService;
