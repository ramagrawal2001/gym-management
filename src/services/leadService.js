import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getLeads = async (params) => {
  const response = await api.get(API_ENDPOINTS.LEADS.BASE, { params });
  return response;
};

export const getLead = async (leadId) => {
  const response = await api.get(`${API_ENDPOINTS.LEADS.BASE}/${leadId}`);
  return response;
};

export const createLead = async (leadData) => {
  const response = await api.post(API_ENDPOINTS.LEADS.BASE, leadData);
  return response;
};

export const updateLead = async (leadId, leadData) => {
  const response = await api.put(`${API_ENDPOINTS.LEADS.BASE}/${leadId}`, leadData);
  return response;
};

export const updateLeadStatus = async (leadId, status, memberId = null) => {
  const response = await api.put(API_ENDPOINTS.LEADS.STATUS(leadId), { status, memberId });
  return response;
};

export const deleteLead = async (leadId) => {
  const response = await api.delete(`${API_ENDPOINTS.LEADS.BASE}/${leadId}`);
  return response;
};

