import express from 'express';
import { getMyPayments, getPayments, getPayment, createPayment, updatePayment, deletePayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope, enforceMemberScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin, memberOnly } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('payments'));

// Member-specific route (before enforceGymScope)
router.get('/me', memberOnly, enforceMemberScope, getMyPayments);

// Other routes require gym scope
router.use(enforceGymScope);

router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/', ownerOrSuperAdmin, createPayment);
router.put('/:id', ownerOrSuperAdmin, updatePayment);
router.delete('/:id', ownerOrSuperAdmin, deletePayment);

export default router;

