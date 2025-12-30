import express from 'express';
import {
    getProfitLossReport,
    getExpenseTrends,
    getRevenueTrends,
    getCategoryBreakdown,
    getFinancialSummary
} from '../controllers/financialReportController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);
router.use(checkFeature('financial'));
router.use(enforceGymScope);
router.use(ownerOrSuperAdmin);

router.get('/profit-loss', getProfitLossReport);
router.get('/expense-trends', getExpenseTrends);
router.get('/revenue-trends', getRevenueTrends);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/summary', getFinancialSummary);

export default router;
