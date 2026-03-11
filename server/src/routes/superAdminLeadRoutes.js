import express from 'express';
import {
    createLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
    addLeadNote,
    getLeadStats
} from '../controllers/superAdminLeadController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Apply super admin authentication and authorization to all lead routes
router.use(authenticate);
router.use(authorize('super_admin'));

router.route('/stats/overview')
    .get(getLeadStats);

router.route('/')
    .get(getLeads)
    .post(createLead);

router.route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(deleteLead);

router.route('/:id/notes')
    .post(addLeadNote);

export default router;
