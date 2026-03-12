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
  const { profileImageFile, ...data } = staffData;
  
  // If there's a profile image file, use FormData
  if (profileImageFile && profileImageFile instanceof File) {
    const formData = new FormData();
    formData.append('profileImage', profileImageFile);
    formData.append('data', JSON.stringify(data));
    
    const response = await api.post(API_ENDPOINTS.STAFF.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
  
  // Otherwise, send as JSON
  const response = await api.post(API_ENDPOINTS.STAFF.BASE, data);
  return response;
};

export const updateStaff = async (staffId, staffData) => {
  const { profileImageFile, ...data } = staffData;
  
  // If there's a profile image file, use FormData
  if (profileImageFile && profileImageFile instanceof File) {
    const formData = new FormData();
    formData.append('profileImage', profileImageFile);
    formData.append('data', JSON.stringify(data));
    
    const response = await api.put(`${API_ENDPOINTS.STAFF.BASE}/${staffId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
  
  // Otherwise, send as JSON
  const response = await api.put(`${API_ENDPOINTS.STAFF.BASE}/${staffId}`, data);
  return response;
};

export const deleteStaff = async (staffId) => {
  const response = await api.delete(`${API_ENDPOINTS.STAFF.BASE}/${staffId}`);
  return response;
};

