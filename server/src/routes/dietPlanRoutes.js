import express from 'express';
import {
    getDietPlans,
    getDietPlan,
    createDietPlan,
    updateDietPlan,
    deleteDietPlan,
    assignDietPlan,
    getMyDietPlan
} from '../controllers/dietPlanController.js';
import { authenticate } from '../middleware/auth.js';
import { staffOrAbove, memberOnly } from '../middleware/rbac.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);
router.use(enforceGymScope);

// Member routes
router.get('/my-plan', memberOnly, getMyDietPlan);

// Owner/Staff routes
router.get('/', staffOrAbove, getDietPlans);
router.get('/:id', staffOrAbove, getDietPlan);
router.post('/', staffOrAbove, createDietPlan);
router.put('/:id', staffOrAbove, updateDietPlan);
router.delete('/:id', staffOrAbove, deleteDietPlan);
router.post('/:id/assign', staffOrAbove, assignDietPlan);

export default router;
