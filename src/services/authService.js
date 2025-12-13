import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const login = async (credentials) => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response;
};

export const register = async (userData) => {
  const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  return response;
};

export const getCurrentUser = async () => {
  const response = await api.get(API_ENDPOINTS.AUTH.ME);
  return response;
};

export const updateProfile = async (profileData) => {
  const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
  return response;
};

export const changePassword = async (passwordData) => {
  const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  return response;
};

