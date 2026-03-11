import api from './api';

const LEAD_API_URL = '/super-admin/leads';

export const getLeads = (queryParams = '') => {
    return api.get(`${LEAD_API_URL}${queryParams ? `?${queryParams}` : ''}`);
};

export const getLeadStats = () => {
    return api.get(`${LEAD_API_URL}/stats/overview`);
};

export const getLead = (id) => {
    return api.get(`${LEAD_API_URL}/${id}`);
};

export const createLead = (leadData) => {
    return api.post(LEAD_API_URL, leadData);
};

export const updateLead = (id, leadData) => {
    return api.put(`${LEAD_API_URL}/${id}`, leadData);
};

export const deleteLead = (id) => {
    return api.delete(`${LEAD_API_URL}/${id}`);
};

export const addLeadNote = (id, text, status) => {
    return api.post(`${LEAD_API_URL}/${id}/notes`, { text, status });
};
