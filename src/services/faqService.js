import api from './api';

// FAQ API calls
export const getFAQs = (params) => {
    return api.get('/faqs', { params });
};

export const getFAQById = (id) => {
    return api.get(`/faqs/${id}`);
};

export const createFAQ = (data) => {
    return api.post('/faqs', data);
};

export const updateFAQ = (id, data) => {
    return api.put(`/faqs/${id}`, data);
};

export const deleteFAQ = (id) => {
    return api.delete(`/faqs/${id}`);
};

export const rateFAQ = (id, helpful) => {
    return api.post(`/faqs/${id}/rate`, { helpful });
};

export const getFAQCategories = () => {
    return api.get('/faqs/categories');
};
