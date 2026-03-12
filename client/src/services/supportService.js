import api from './api';

// Support Ticket API calls
export const createSupportTicket = (data) => {
    return api.post('/support/tickets', data);
};

export const getSupportTickets = (params) => {
    return api.get('/support/tickets', { params });
};

export const getSupportTicketById = (id) => {
    return api.get(`/support/tickets/${id}`);
};

export const updateSupportTicket = (id, data) => {
    return api.put(`/support/tickets/${id}`, data);
};

export const addTicketReply = (id, message) => {
    return api.post(`/support/tickets/${id}/reply`, { message });
};

export const assignTicket = (id, assignedTo) => {
    return api.put(`/support/tickets/${id}/assign`, { assignedTo });
};

export const getTicketStats = () => {
    return api.get('/support/tickets/stats');
};
