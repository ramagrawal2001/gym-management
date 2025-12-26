import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

// ============================================
// USER NOTIFICATION ROUTES
// ============================================

// Get user's notifications
router.get('/', auth, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', auth, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', auth, notificationController.markAllAsRead);

// ============================================
// GYM OWNER ROUTES - SETTINGS
// ============================================

// Get notification settings
router.get('/settings', auth, authorize('owner', 'super_admin'), notificationController.getSettings);

// Update notification settings
router.put('/settings', auth, authorize('owner', 'super_admin'), notificationController.updateSettings);

// ============================================
// GYM OWNER ROUTES - TEMPLATES
// ============================================

// Get notification templates
router.get('/templates', auth, authorize('owner', 'super_admin'), notificationController.getTemplates);

// Create/Update template
router.post('/templates', auth, authorize('owner', 'super_admin'), notificationController.saveTemplate);

// Delete template
router.delete('/templates/:id', auth, authorize('owner', 'super_admin'), notificationController.deleteTemplate);

// ============================================
// GYM OWNER ROUTES - TESTING & LOGS
// ============================================

// Send test notification
router.post('/test', auth, authorize('owner', 'super_admin'), notificationController.sendTestNotification);

// Get notification logs
router.get('/logs', auth, authorize('owner', 'super_admin'), notificationController.getLogs);

// Check SMS balance
router.get('/sms-balance', auth, authorize('owner', 'super_admin'), notificationController.checkSMSBalance);

export default router;
