import express from 'express';
import { getPayments, getPayment, createPayment, updatePayment, deletePayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceGymScope);

router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/', staffOrAbove, createPayment);
router.put('/:id', staffOrAbove, updatePayment);
router.delete('/:id', ownerOrSuperAdmin, deletePayment);

export default router;

