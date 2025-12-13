import express from 'express';
import { getGyms, getGym, createGym, updateGym, updateGymFeatures, updateGymBranding } from '../controllers/gymController.js';
import { authenticate } from '../middleware/auth.js';
import { superAdminOnly, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, superAdminOnly, getGyms);
router.get('/:id', authenticate, getGym);
router.post('/', authenticate, superAdminOnly, createGym);
router.put('/:id', authenticate, ownerOrSuperAdmin, updateGym);
router.put('/:id/features', authenticate, superAdminOnly, updateGymFeatures);
router.put('/:id/branding', authenticate, ownerOrSuperAdmin, updateGymBranding);

export default router;

