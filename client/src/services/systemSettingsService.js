import api from './api';

export const getSystemSettings = async () => {
    try {
        const response = await api.get('/system-settings');
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch system settings';
    }
};

export const updateSystemSettings = async (settings) => {
    try {
        const response = await api.put('/system-settings', settings);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to update system settings';
    }
};
