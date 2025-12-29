import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Get auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Revenue Sources API
export const revenueSourceService = {
    // Get all revenue sources
    getAll: async (includeInactive = false) => {
        const response = await axios.get(`${API_BASE_URL}/revenue-sources`, {
            params: { includeInactive },
            headers: getAuthToken()
        });
        return response.data;
    },

    // Get single revenue source
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/revenue-sources/${id}`, {
            headers: getAuthToken()
        });
        return response.data;
    },

    // Create custom revenue source
    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/revenue-sources`, data, {
            headers: getAuthToken()
        });
        return response.data;
    },

    // Update revenue source
    update: async (id, data) => {
        const response = await axios.put(`${API_BASE_URL}/revenue-sources/${id}`, data, {
            headers: getAuthToken()
        });
        return response.data;
    },

    // Toggle revenue source (enable/disable)
    toggle: async (id) => {
        const response = await axios.patch(`${API_BASE_URL}/revenue-sources/${id}/toggle`, {}, {
            headers: getAuthToken()
        });
        return response.data;
    },

    // Delete revenue source
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/revenue-sources/${id}`, {
            headers: getAuthToken()
        });
        return response.data;
    },

    // Get revenue source statistics
    getStats: async (startDate = null, endDate = null) => {
        const response = await axios.get(`${API_BASE_URL}/revenue-sources/stats`, {
            params: { startDate, endDate },
            headers: getAuthToken()
        });
        return response.data;
    }
};

export default revenueSourceService;
