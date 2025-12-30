import express from 'express';
import { getPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/planController.js';
import { authenticate } from '../middleware/auth.js';
import { superAdminOnly, ownerOrSuperAdmin } from '../middleware/rbac.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// Super admin can access all plans, others need gym scope
router.get('/', getPlans);
router.get('/:id', getPlan);
router.post('/', ownerOrSuperAdmin, enforceGymScope, createPlan);
router.put('/:id', ownerOrSuperAdmin, enforceGymScope, updatePlan);
router.delete('/:id', ownerOrSuperAdmin, enforceGymScope, deletePlan);

export default router;

