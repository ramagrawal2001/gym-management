import api from './api';

// Member Access API calls
export const getGymMemberAccessSettings = () => {
    return api.get('/member-access/gym-settings');
};

export const updateGymMemberAccessSettings = (data) => {
    return api.put('/member-access/gym-settings', data);
};

export const getMemberAccess = (memberId) => {
    return api.get(`/member-access/member/${memberId}`);
};

export const updateMemberAccess = (memberId, data) => {
    return api.put(`/member-access/member/${memberId}`, data);
};

export const bulkUpdateMemberAccess = (data) => {
    return api.post('/member-access/bulk', data);
};
