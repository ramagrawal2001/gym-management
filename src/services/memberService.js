import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getMembers = async (params) => {
  const response = await api.get(API_ENDPOINTS.MEMBERS.BASE, { params });
  return response;
};

export const getMember = async (memberId) => {
  const response = await api.get(`${API_ENDPOINTS.MEMBERS.BASE}/${memberId}`);
  return response;
};

export const createMember = async (memberData) => {
  const { profileImageFile, ...data } = memberData;
  
  // If there's a profile image file, use FormData
  if (profileImageFile && profileImageFile instanceof File) {
    const formData = new FormData();
    formData.append('profileImage', profileImageFile);
    formData.append('data', JSON.stringify(data));
    
    const response = await api.post(API_ENDPOINTS.MEMBERS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
  
  // Otherwise, send as JSON
  const response = await api.post(API_ENDPOINTS.MEMBERS.BASE, data);
  return response;
};

export const updateMember = async (memberId, memberData) => {
  const { profileImageFile, ...data } = memberData;
  
  // If there's a profile image file, use FormData
  if (profileImageFile && profileImageFile instanceof File) {
    const formData = new FormData();
    formData.append('profileImage', profileImageFile);
    formData.append('data', JSON.stringify(data));
    
    const response = await api.put(`${API_ENDPOINTS.MEMBERS.BASE}/${memberId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
  
  // Otherwise, send as JSON
  const response = await api.put(`${API_ENDPOINTS.MEMBERS.BASE}/${memberId}`, data);
  return response;
};

export const renewMember = async (memberId, renewalData) => {
  const response = await api.put(API_ENDPOINTS.MEMBERS.RENEW(memberId), renewalData);
  return response;
};

export const deleteMember = async (memberId) => {
  const response = await api.delete(`${API_ENDPOINTS.MEMBERS.BASE}/${memberId}`);
  return response;
};

export const getMyProfile = async () => {
  const response = await api.get(`${API_ENDPOINTS.MEMBERS.BASE}/me`);
  return response;
};

