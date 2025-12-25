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

// Super admin routes
router.get('/', authorize('super_admin'), getSubscriptions);
router.put('/:id/cancel', authorize('super_admin'), cancelSubscription);

export default router;
