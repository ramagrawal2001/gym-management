import api from './api.js';

/**
 * Notification Service - Frontend API
 */

// ============================================
// USER NOTIFICATIONS
// ============================================

/**
 * Get user's notifications
 */
export const getNotifications = async (options = {}) => {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const response = await api.get('/notifications', {
        params: { page, limit, unreadOnly }
    });
    return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};

// ============================================
// GYM OWNER - SETTINGS
// ============================================

/**
 * Get notification settings
 */
export const getSettings = async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
};

/**
 * Update notification settings
 */
export const updateSettings = async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
};

// ============================================
// GYM OWNER - TEMPLATES
// ============================================

/**
 * Get notification templates
 */
export const getTemplates = async () => {
    const response = await api.get('/notifications/templates');
    return response.data;
};

/**
 * Save notification template
 */
export const saveTemplate = async (template) => {
    const response = await api.post('/notifications/templates', template);
    return response.data;
};

/**
 * Delete notification template
 */
export const deleteTemplate = async (templateId) => {
    const response = await api.delete(`/notifications/templates/${templateId}`);
    return response.data;
};

// ============================================
// GYM OWNER - TESTING & LOGS
// ============================================

/**
 * Send test notification
 */
export const sendTestNotification = async (options) => {
    const response = await api.post('/notifications/test', options);
    return response.data;
};

/**
 * Get notification logs
 */
export const getLogs = async (options = {}) => {
    const { page = 1, limit = 50, channel, type, status } = options;
    const response = await api.get('/notifications/logs', {
        params: { page, limit, channel, type, status }
    });
    return response.data;
};

/**
 * Check SMS balance
 */
export const checkSMSBalance = async () => {
    const response = await api.get('/notifications/sms-balance');
    return response.data;
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getSettings,
    updateSettings,
    getTemplates,
    saveTemplate,
    deleteTemplate,
    sendTestNotification,
    getLogs,
    checkSMSBalance
};
