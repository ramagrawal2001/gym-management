import express from 'express';
import { optionalAuthenticate, authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
    getFAQs,
    getFAQById,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    rateFAQ,
    getFAQCategories
} from '../controllers/faqController.js';

const router = express.Router();

// Public routes (no auth required, but can have auth for gym-specific)
router.get('/', optionalAuthenticate, getFAQs);
router.get('/categories', getFAQCategories);
router.get('/:id', getFAQById);

// Rating FAQ (authenticated users)
router.post('/:id/rate', authenticate, rateFAQ);

// Admin routes (owner/super_admin only)
router.post('/', authenticate, authorize('super_admin', 'owner'), createFAQ);
router.put('/:id', authenticate, authorize('super_admin', 'owner'), updateFAQ);
router.delete('/:id', authenticate, authorize('super_admin', 'owner'), deleteFAQ);

export default router;
