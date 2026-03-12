import express from 'express';
import {
    getWorkoutPlans,
    getWorkoutPlan,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    assignWorkoutPlan,
    getMyWorkoutPlan
} from '../controllers/workoutPlanController.js';
import { authenticate } from '../middleware/auth.js';
import { staffOrAbove, memberOnly } from '../middleware/rbac.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);
router.use(enforceGymScope);

// Member routes
router.get('/my-plan', memberOnly, getMyWorkoutPlan);

// Owner/Staff routes
router.get('/', staffOrAbove, getWorkoutPlans);
router.get('/:id', staffOrAbove, getWorkoutPlan);
router.post('/', staffOrAbove, createWorkoutPlan);
router.put('/:id', staffOrAbove, updateWorkoutPlan);
router.delete('/:id', staffOrAbove, deleteWorkoutPlan);
router.post('/:id/assign', staffOrAbove, assignWorkoutPlan);

export default router;
