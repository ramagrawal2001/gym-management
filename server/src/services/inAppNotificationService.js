import Notification from '../models/Notification.js';
import NotificationTemplate from '../models/NotificationTemplate.js';
import NotificationSettings from '../models/NotificationSettings.js';

/**
 * In-App Notification Service
 * Handles database-based notifications shown in the app UI
 */

/**
 * Create an in-app notification
 */
export const createNotification = async ({
    gymId,
    userId,
    memberId,
    title,
    message,
    type = 'general',
    actionUrl = null,
    metadata = {}
}) => {
    try {
        const notification = await Notification.create({
            gymId,
            userId,
            memberId,
            title,
            message,
            type,
            channel: 'in_app',
            status: 'delivered',
            deliveredAt: new Date(),
            actionUrl,
            metadata
        });

        console.log(`✅ In-app notification created: ${title}`);
        return { success: true, notification };
    } catch (error) {
        console.error('❌ In-app notification error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, gymId, options = {}) => {
    const {
        page = 1,
        limit = 20,
        unreadOnly = false
    } = options;

    try {
        const query = {
            userId,
            gymId,
            channel: 'in_app'
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.getUnreadCount(userId, gymId);

        return {
            success: true,
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            unreadCount
        };
    } catch (error) {
        console.error('❌ Get notifications error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get notifications for a member (non-user)
 */
export const getMemberNotifications = async (memberId, gymId, options = {}) => {
    const {
        page = 1,
        limit = 20,
        unreadOnly = false
    } = options;

    try {
        const query = {
            memberId,
            gymId,
            channel: 'in_app'
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            memberId,
            gymId,
            channel: 'in_app',
            isRead: false
        });

        return {
            success: true,
            notifications,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            unreadCount
        };
    } catch (error) {
        console.error('❌ Get member notifications error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            {
                isRead: true,
                readAt: new Date(),
                status: 'read'
            },
            { new: true }
        );

        if (!notification) {
            return { success: false, error: 'Notification not found' };
        }

        return { success: true, notification };
    } catch (error) {
        console.error('❌ Mark as read error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId, gymId) => {
    try {
        const result = await Notification.updateMany(
            { userId, gymId, channel: 'in_app', isRead: false },
            {
                isRead: true,
                readAt: new Date(),
                status: 'read'
            }
        );

        return {
            success: true,
            modifiedCount: result.modifiedCount
        };
    } catch (error) {
        console.error('❌ Mark all as read error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Delete old notifications (cleanup job)
 */
export const cleanupOldNotifications = async (daysToKeep = 90) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await Notification.deleteMany({
            channel: 'in_app',
            createdAt: { $lt: cutoffDate },
            isRead: true
        });

        console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        console.error('❌ Cleanup error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (userId, gymId) => {
    try {
        const count = await Notification.getUnreadCount(userId, gymId);
        return { success: true, count };
    } catch (error) {
        console.error('❌ Get unread count error:', error.message);
        return { success: false, error: error.message };
    }
};

export default {
    createNotification,
    getUserNotifications,
    getMemberNotifications,
    markAsRead,
    markAllAsRead,
    cleanupOldNotifications,
    getUnreadCount
};
