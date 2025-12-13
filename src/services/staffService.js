import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getStaff = async (params) => {
  const response = await api.get(API_ENDPOINTS.STAFF.BASE, { params });
  return response;
};

export const getStaffMember = async (staffId) => {
  const response = await api.get(`${API_ENDPOINTS.STAFF.BASE}/${staffId}`);
  return response;
};

export const createStaff = async (staffData) => {
  const response = await api.post(API_ENDPOINTS.STAFF.BASE, staffData);
  return response;
};

export const updateStaff = async (staffId, staffData) => {
  const response = await api.put(`${API_ENDPOINTS.STAFF.BASE}/${staffId}`, staffData);
  return response;
};

export const deleteStaff = async (staffId) => {
  const response = await api.delete(`${API_ENDPOINTS.STAFF.BASE}/${staffId}`);
  return response;
};

