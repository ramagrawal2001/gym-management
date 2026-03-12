import api from './api';

// Get all subscription plans (Super Admin)
export const getSubscriptionPlans = async (params = {}) => {
    const response = await api.get('/subscription-plans', { params });
    return response.data;
};

// Get my gym's plans (Owner)
export const getMySubscriptionPlans = async () => {
    const response = await api.get('/subscription-plans/my');
    return response.data;
};

// Get single plan
export const getSubscriptionPlan = async (id) => {
    const response = await api.get(`/subscription-plans/${id}`);
    return response.data;
};

// Get plan by payment link token (Public)
export const getPlanByToken = async (token) => {
    const response = await api.get(`/subscription-plans/link/${token}`);
    return response.data;
};

// Create subscription plan (Super Admin)
export const createSubscriptionPlan = async (planData) => {
    const response = await api.post('/subscription-plans', planData);
    return response.data;
};

// Update subscription plan (Super Admin)
export const updateSubscriptionPlan = async (id, planData) => {
    const response = await api.put(`/subscription-plans/${id}`, planData);
    return response.data;
};

// Delete subscription plan (Super Admin)
export const deleteSubscriptionPlan = async (id) => {
    const response = await api.delete(`/subscription-plans/${id}`);
    return response.data;
};

// Regenerate payment link (Super Admin)
export const regeneratePaymentLink = async (id) => {
    const response = await api.post(`/subscription-plans/${id}/regenerate-link`);
    return response.data;
};

export default {
    getSubscriptionPlans,
    getMySubscriptionPlans,
    getSubscriptionPlan,
    getPlanByToken,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    regeneratePaymentLink
};
