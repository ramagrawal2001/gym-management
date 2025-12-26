import Notification from '../models/Notification.js';
import NotificationTemplate from '../models/NotificationTemplate.js';
import NotificationSettings from '../models/NotificationSettings.js';
import notificationService from '../services/notificationService.js';
import inAppService from '../services/inAppNotificationService.js';
import smsService from '../services/smsService.js';

/**
 * Get user's notifications
 */
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const userId = req.user._id;
        const gymId = req.user.gymId || req.query.gymId;

        const result = await inAppService.getUserNotifications(userId, gymId, {
            page: parseInt(page),
            limit: parseInt(limit),
            unreadOnly: unreadOnly === 'true'
        });

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        res.json(result);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const gymId = req.user.gymId || req.query.gymId;

        const result = await inAppService.getUnreadCount(userId, gymId);

        res.json({ count: result.count || 0 });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const result = await inAppService.markAsRead(id, userId);

        if (!result.success) {
            return res.status(404).json({ error: result.error });
        }

        res.json({ message: 'Notification marked as read', notification: result.notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const gymId = req.user.gymId || req.body.gymId;

        const result = await inAppService.markAllAsRead(userId, gymId);

        res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

/**
 * Get notification settings (gym owner)
 */
export const getSettings = async (req, res) => {
    try {
        const gymId = req.user.gymId || req.params.gymId;

        const settings = await NotificationSettings.getOrCreate(gymId);

        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get notification settings' });
    }
};

/**
 * Update notification settings (gym owner)
 */
export const updateSettings = async (req, res) => {
    try {
        const gymId = req.user.gymId || req.params.gymId;
        const updates = req.body;

        const settings = await NotificationSettings.findOneAndUpdate(
            { gymId },
            { $set: updates },
            { new: true, upsert: true }
        );

        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

/**
 * Get notification templates (gym owner)
 */
export const getTemplates = async (req, res) => {
    try {
        const gymId = req.user.gymId || req.query.gymId;

        // Get gym-specific and system default templates
        const templates = await NotificationTemplate.find({
            $or: [
                { gymId },
                { isSystemDefault: true }
            ]
        }).sort({ type: 1 });

        res.json(templates);
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Failed to get templates' });
    }
};

/**
 * Create/Update template (gym owner)
 */
export const saveTemplate = async (req, res) => {
    try {
        const gymId = req.user.gymId;
        const { type, name, channels, email, sms, inApp, variables, isActive } = req.body;

        const template = await NotificationTemplate.findOneAndUpdate(
            { gymId, type },
            {
                gymId,
                type,
                name,
                channels,
                email,
                sms,
                inApp,
                variables,
                isActive
            },
            { new: true, upsert: true }
        );

        res.json({ message: 'Template saved', template });
    } catch (error) {
        console.error('Save template error:', error);
        res.status(500).json({ error: 'Failed to save template' });
    }
};

/**
 * Delete template (gym owner)
 */
export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const gymId = req.user.gymId;

        const template = await NotificationTemplate.findOneAndDelete({
            _id: id,
            gymId,
            isSystemDefault: false // Can't delete system templates
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found or cannot be deleted' });
        }

        res.json({ message: 'Template deleted' });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
};

/**
 * Send test notification (gym owner)
 */
export const sendTestNotification = async (req, res) => {
    try {
        const gymId = req.user.gymId;
        const { channel, type, recipient } = req.body;

        const result = await notificationService.sendNotification({
            gymId,
            type: type || 'general',
            recipient: {
                userId: req.user._id,
                email: recipient?.email || req.user.email,
                phone: recipient?.phone || req.user.phone,
                name: req.user.firstName || 'Test User'
            },
            data: {
                memberName: 'Test User',
                gymName: 'Your Gym',
                message: 'This is a test notification from GymOS.',
                title: 'Test Notification'
            },
            channels: channel ? [channel] : null
        });

        res.json({ message: 'Test notification sent', result });
    } catch (error) {
        console.error('Send test notification error:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
};

/**
 * Get notification logs (gym owner)
 */
export const getLogs = async (req, res) => {
    try {
        const gymId = req.user.gymId || req.query.gymId;
        const { page = 1, limit = 50, channel, type, status } = req.query;

        const query = { gymId };
        if (channel) query.channel = channel;
        if (type) query.type = type;
        if (status) query.status = status;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('userId', 'firstName lastName email')
            .populate('memberId', 'name email phone');

        const total = await Notification.countDocuments(query);

        res.json({
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to get notification logs' });
    }
};

/**
 * Check SMS balance
 */
export const checkSMSBalance = async (req, res) => {
    try {
        const result = await smsService.checkBalance();
        res.json(result);
    } catch (error) {
        console.error('Check balance error:', error);
        res.status(500).json({ error: 'Failed to check SMS balance' });
    }
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
