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
  const response = await api.post(API_ENDPOINTS.MEMBERS.BASE, memberData);
  return response;
};

export const updateMember = async (memberId, memberData) => {
  const response = await api.put(`${API_ENDPOINTS.MEMBERS.BASE}/${memberId}`, memberData);
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

