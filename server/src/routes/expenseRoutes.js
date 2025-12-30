import express from 'express';
import {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getExpenseStats,
    exportExpenses,
    importExpenses
} from '../controllers/expenseController.js';
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

// Stats and export/import routes (before :id routes)
router.get('/stats', ownerOrSuperAdmin, getExpenseStats);
router.get('/export', ownerOrSuperAdmin, exportExpenses);
router.post('/import', ownerOrSuperAdmin, importExpenses);

// CRUD routes
router.get('/', staffOrAbove, getExpenses);
router.get('/:id', staffOrAbove, getExpense);
router.post('/', staffOrAbove, createExpense);
router.put('/:id', staffOrAbove, updateExpense);
router.delete('/:id', ownerOrSuperAdmin, deleteExpense);

// Approval routes
router.post('/:id/approve', ownerOrSuperAdmin, approveExpense);
router.post('/:id/reject', ownerOrSuperAdmin, rejectExpense);

export default router;
