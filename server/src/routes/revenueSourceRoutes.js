import express from 'express';
import {
    getRevenueSources,
    getRevenueSource,
    createRevenueSource,
    updateRevenueSource,
    toggleRevenueSource,
    deleteRevenueSource,
    getRevenueSourceStats
} from '../controllers/revenueSourceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin } from '../middleware/rbac.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

// All routes require authentication and gym scope
router.use(authenticate);
router.use(requireActiveSubscription);
router.use(enforceGymScope);

// GET /api/v1/revenue-sources - Get all sources
router.get('/', getRevenueSources);

// GET /api/v1/revenue-sources/stats - Get statistics
router.get('/stats', getRevenueSourceStats);

// GET /api/v1/revenue-sources/:id - Get single source
router.get('/:id', getRevenueSource);

// POST /api/v1/revenue-sources - Create custom source
router.post('/', ownerOrSuperAdmin, createRevenueSource);

// PUT /api/v1/revenue-sources/:id - Update source
router.put('/:id', ownerOrSuperAdmin, updateRevenueSource);

// PATCH /api/v1/revenue-sources/:id/toggle - Toggle active/inactive
router.patch('/:id/toggle', ownerOrSuperAdmin, toggleRevenueSource);

// DELETE /api/v1/revenue-sources/:id - Delete source (soft)
router.delete('/:id', ownerOrSuperAdmin, deleteRevenueSource);

export default router;
