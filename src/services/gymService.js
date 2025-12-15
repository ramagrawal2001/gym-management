import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getGyms = async (params) => {
  const response = await api.get(API_ENDPOINTS.GYMS.BASE, { params });
  return response;
};

export const getGym = async (gymId) => {
  const response = await api.get(`${API_ENDPOINTS.GYMS.BASE}/${gymId}`);
  return response;
};

export const createGym = async (gymData) => {
  const response = await api.post(API_ENDPOINTS.GYMS.BASE, gymData);
  return response;
};

export const updateGym = async (gymId, gymData) => {
  const response = await api.put(`${API_ENDPOINTS.GYMS.BASE}/${gymId}`, gymData);
  return response;
};

export const updateGymFeatures = async (gymId, features) => {
  const response = await api.put(API_ENDPOINTS.GYMS.FEATURES(gymId), features);
  return response;
};

export const updateGymBranding = async (gymId, branding) => {
  const response = await api.put(API_ENDPOINTS.GYMS.BRANDING(gymId), branding);
  return response;
};

export const getGymAnalytics = async (gymId) => {
  const response = await api.get(`${API_ENDPOINTS.GYMS.BASE}/${gymId}/analytics`);
  return response;
};

export const getGymMembers = async (gymId, params) => {
  const response = await api.get(`${API_ENDPOINTS.GYMS.BASE}/${gymId}/members`, { params });
  return response;
};

export const getGymStaff = async (gymId, params) => {
  const response = await api.get(`${API_ENDPOINTS.GYMS.BASE}/${gymId}/staff`, { params });
  return response;
};

export const suspendGym = async (gymId, isActive) => {
  const response = await api.put(`${API_ENDPOINTS.GYMS.BASE}/${gymId}/suspend`, { isActive });
  return response;
};

export const deleteGym = async (gymId) => {
  const response = await api.delete(`${API_ENDPOINTS.GYMS.BASE}/${gymId}`);
  return response;
};

