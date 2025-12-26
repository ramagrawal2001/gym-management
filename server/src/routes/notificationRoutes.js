import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

// ============================================
// USER NOTIFICATION ROUTES
// ============================================

// Get user's notifications
router.get('/', authenticate, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// ============================================
// GYM OWNER ROUTES - SETTINGS
// ============================================

// Get notification settings
router.get('/settings', authenticate, authorize('owner', 'super_admin'), notificationController.getSettings);

// Update notification settings
router.put('/settings', authenticate, authorize('owner', 'super_admin'), notificationController.updateSettings);

// ============================================
// GYM OWNER ROUTES - TEMPLATES
// ============================================

// Get notification templates
router.get('/templates', authenticate, authorize('owner', 'super_admin'), notificationController.getTemplates);

// Create/Update template
router.post('/templates', authenticate, authorize('owner', 'super_admin'), notificationController.saveTemplate);

// Delete template
router.delete('/templates/:id', authenticate, authorize('owner', 'super_admin'), notificationController.deleteTemplate);

// ============================================
// GYM OWNER ROUTES - TESTING & LOGS
// ============================================

// Send test notification
router.post('/test', authenticate, authorize('owner', 'super_admin'), notificationController.sendTestNotification);

// Get notification logs
router.get('/logs', authenticate, authorize('owner', 'super_admin'), notificationController.getLogs);

// Check SMS balance
router.get('/sms-balance', authenticate, authorize('owner', 'super_admin'), notificationController.checkSMSBalance);

export default router;
