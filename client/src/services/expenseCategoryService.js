import apiClient from './api';

const BASE_URL = '/expense-categories';

export const expenseCategoryService = {
    // Get all categories
    getAll: async () => {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    },

    // Get single category
    getById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Create category
    create: async (categoryData) => {
        const response = await apiClient.post(BASE_URL, categoryData);
        return response.data;
    },

    // Update category
    update: async (id, categoryData) => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, categoryData);
        return response.data;
    },

    // Delete category
    delete: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    }
};

export default expenseCategoryService;
