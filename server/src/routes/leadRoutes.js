import express from 'express';
import { getLeads, getLead, createLead, updateLead, updateLeadStatus, deleteLead } from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { checkFeature } from '../middleware/featureGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('crm'));
router.use(enforceGymScope);

router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', createLead);
router.put('/:id', updateLead);
router.put('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

export default router;

