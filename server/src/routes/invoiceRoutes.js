import express from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, markAsPaid, deleteInvoice } from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceGymScope);

router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', staffOrAbove, createInvoice);
router.put('/:id', staffOrAbove, updateInvoice);
router.put('/:id/paid', staffOrAbove, markAsPaid);
router.delete('/:id', ownerOrSuperAdmin, deleteInvoice);

export default router;

