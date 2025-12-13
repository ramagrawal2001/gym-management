import express from 'express';
import { getPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/planController.js';
import { authenticate } from '../middleware/auth.js';
import { superAdminOnly, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, getPlans);
router.get('/:id', authenticate, getPlan);
router.post('/', authenticate, ownerOrSuperAdmin, createPlan);
router.put('/:id', authenticate, ownerOrSuperAdmin, updatePlan);
router.delete('/:id', authenticate, superAdminOnly, deletePlan);

export default router;

