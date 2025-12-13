import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getPlans = async (params) => {
  const response = await api.get(API_ENDPOINTS.PLANS.BASE, { params });
  return response;
};

export const getPlan = async (planId) => {
  const response = await api.get(`${API_ENDPOINTS.PLANS.BASE}/${planId}`);
  return response;
};

export const createPlan = async (planData) => {
  const response = await api.post(API_ENDPOINTS.PLANS.BASE, planData);
  return response;
};

export const updatePlan = async (planId, planData) => {
  const response = await api.put(`${API_ENDPOINTS.PLANS.BASE}/${planId}`, planData);
  return response;
};

export const deletePlan = async (planId) => {
  const response = await api.delete(`${API_ENDPOINTS.PLANS.BASE}/${planId}`);
  return response;
};

