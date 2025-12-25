import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
    getPlans,
    getMyPlans,
    getPlan,
    getPlanByToken,
    createPlan,
    updatePlan,
    deletePlan,
    regeneratePaymentLink
} from '../controllers/subscriptionPlanController.js';

const router = express.Router();

// Public route - Get plan by payment link token
router.get('/link/:token', getPlanByToken);

// Protected routes
router.use(authenticate);

// Gym owner route - Get my plans
router.get('/my', getMyPlans);

// Super admin routes
router.get('/', authorize('super_admin'), getPlans);
router.get('/:id', getPlan);
router.post('/', authorize('super_admin'), createPlan);
router.put('/:id', authorize('super_admin'), updatePlan);
router.delete('/:id', authorize('super_admin'), deletePlan);
router.post('/:id/regenerate-link', authorize('super_admin'), regeneratePaymentLink);

export default router;
