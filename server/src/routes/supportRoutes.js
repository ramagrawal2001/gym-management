import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    addReply,
    assignTicket,
    getTicketStats
} from '../controllers/supportController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Ticket operations (all authenticated users can create and view their tickets)
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/stats', requireActiveSubscription, authorize('super_admin', 'owner', 'staff'), getTicketStats);
router.get('/tickets/:id', getTicketById);

// Ticket management (owner/staff/super_admin) - require subscription
router.put('/tickets/:id', requireActiveSubscription, authorize('super_admin', 'owner', 'staff'), updateTicket);
router.put('/tickets/:id/assign', requireActiveSubscription, authorize('super_admin', 'owner'), assignTicket);

// Replies (all users can reply to their tickets, staff can reply to any)
router.post('/tickets/:id/reply', addReply);

export default router;
