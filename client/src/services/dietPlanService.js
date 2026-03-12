import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getDietPlans = async (params = {}) => {
    return await api.get(API_ENDPOINTS.DIET_PLANS.BASE, { params });
};

export const getDietPlan = async (id) => {
    return await api.get(`${API_ENDPOINTS.DIET_PLANS.BASE}/${id}`);
};

export const createDietPlan = async (data) => {
    return await api.post(API_ENDPOINTS.DIET_PLANS.BASE, data);
};

export const updateDietPlan = async (id, data) => {
    return await api.put(`${API_ENDPOINTS.DIET_PLANS.BASE}/${id}`, data);
};

export const deleteDietPlan = async (id) => {
    return await api.delete(`${API_ENDPOINTS.DIET_PLANS.BASE}/${id}`);
};

export const assignDietPlan = async (id, memberIds) => {
    return await api.post(API_ENDPOINTS.DIET_PLANS.ASSIGN(id), { memberIds });
};

export const getMyDietPlan = async () => {
    return await api.get(API_ENDPOINTS.DIET_PLANS.MY_PLAN);
};
