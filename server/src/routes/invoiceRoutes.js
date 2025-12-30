import express from 'express';
import { getMyInvoices, getInvoices, getInvoice, createInvoice, updateInvoice, markAsPaid, deleteInvoice } from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope, enforceMemberScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin, memberOnly } from '../middleware/rbac.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// Member-specific route (before enforceGymScope)
router.get('/me', memberOnly, enforceMemberScope, getMyInvoices);

// Other routes require gym scope
router.use(enforceGymScope);

router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', ownerOrSuperAdmin, createInvoice);
router.put('/:id', ownerOrSuperAdmin, updateInvoice);
router.put('/:id/paid', ownerOrSuperAdmin, markAsPaid);
router.delete('/:id', ownerOrSuperAdmin, deleteInvoice);

export default router;

