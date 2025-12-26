import express from 'express';
import {
    getExpenseCategories,
    getExpenseCategory,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory
} from '../controllers/expenseCategoryController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('financial'));
router.use(enforceGymScope);

router.get('/', getExpenseCategories);
router.get('/:id', getExpenseCategory);
router.post('/', ownerOrSuperAdmin, createExpenseCategory);
router.put('/:id', ownerOrSuperAdmin, updateExpenseCategory);
router.delete('/:id', ownerOrSuperAdmin, deleteExpenseCategory);

export default router;
