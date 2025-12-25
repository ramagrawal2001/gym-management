import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
    getSubscriptions,
    getMySubscription,
    createPaymentOrder,
    verifyPaymentAndActivate,
    getPaymentHistory,
    getInvoices,
    cancelSubscription,
    upgradeSubscription,
    downgradeSubscription,
    approveManualPayment,
    checkAndExpireSubscriptions,
    getAuditLogs,
    handleRazorpayWebhook
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Public routes for payment
router.post('/create-order', createPaymentOrder);
router.post('/verify-payment', verifyPaymentAndActivate);

// Protected routes
router.use(authenticate);

// Gym owner routes
router.get('/me', getMySubscription);
router.get('/payments', getPaymentHistory);
router.get('/invoices', getInvoices);

// Upgrade/Downgrade (Owner can initiate, Super Admin can process)
router.put('/:id/upgrade', authorize('super_admin', 'owner'), upgradeSubscription);
router.put('/:id/downgrade', authorize('super_admin', 'owner'), downgradeSubscription);

// Super admin routes
router.get('/', authorize('super_admin'), getSubscriptions);
router.put('/:id/cancel', authorize('super_admin'), cancelSubscription);
router.put('/invoices/:id/approve-manual', authorize('super_admin'), approveManualPayment);
router.post('/check-expiry', authorize('super_admin'), checkAndExpireSubscriptions);
router.get('/audit-logs', authorize('super_admin', 'owner'), getAuditLogs);

export default router;

