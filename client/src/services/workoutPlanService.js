import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getWorkoutPlans = async (params = {}) => {
    return await api.get(API_ENDPOINTS.WORKOUT_PLANS.BASE, { params });
};

export const getWorkoutPlan = async (id) => {
    return await api.get(`${API_ENDPOINTS.WORKOUT_PLANS.BASE}/${id}`);
};

export const createWorkoutPlan = async (data) => {
    return await api.post(API_ENDPOINTS.WORKOUT_PLANS.BASE, data);
};

export const updateWorkoutPlan = async (id, data) => {
    return await api.put(`${API_ENDPOINTS.WORKOUT_PLANS.BASE}/${id}`, data);
};

export const deleteWorkoutPlan = async (id) => {
    return await api.delete(`${API_ENDPOINTS.WORKOUT_PLANS.BASE}/${id}`);
};

export const assignWorkoutPlan = async (id, memberIds) => {
    return await api.post(API_ENDPOINTS.WORKOUT_PLANS.ASSIGN(id), { memberIds });
};

export const getMyWorkoutPlan = async () => {
    return await api.get(API_ENDPOINTS.WORKOUT_PLANS.MY_PLAN);
};
