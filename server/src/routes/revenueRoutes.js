import express from 'express';
import {
    getRevenues,
    getRevenue,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    getRevenueStats,
    getExpectedRevenue
} from '../controllers/revenueController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin, staffOrAbove } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);
router.use(checkFeature('financial'));
router.use(enforceGymScope);

// Stats route (before :id routes)
router.get('/stats', ownerOrSuperAdmin, getRevenueStats);
router.get('/expected', ownerOrSuperAdmin, getExpectedRevenue);

// CRUD routes
router.get('/', staffOrAbove, getRevenues);
router.get('/:id', staffOrAbove, getRevenue);
router.post('/', staffOrAbove, createRevenue);
router.put('/:id', staffOrAbove, updateRevenue);
router.delete('/:id', ownerOrSuperAdmin, deleteRevenue);

export default router;
