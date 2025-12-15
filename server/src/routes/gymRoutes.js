import express from 'express';
import { 
  getGyms, 
  getGym, 
  createGym, 
  updateGym, 
  updateGymFeatures, 
  updateGymBranding,
  suspendGym,
  deleteGym,
  getGymAnalytics,
  getGymMembers,
  getGymStaff
} from '../controllers/gymController.js';
import { authenticate } from '../middleware/auth.js';
import { superAdminOnly, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, superAdminOnly, getGyms);
router.get('/:id', authenticate, getGym);
router.get('/:id/analytics', authenticate, superAdminOnly, getGymAnalytics);
router.get('/:id/members', authenticate, superAdminOnly, getGymMembers);
router.get('/:id/staff', authenticate, superAdminOnly, getGymStaff);
router.post('/', authenticate, superAdminOnly, createGym);
router.put('/:id', authenticate, ownerOrSuperAdmin, updateGym);
router.put('/:id/features', authenticate, superAdminOnly, updateGymFeatures);
router.put('/:id/branding', authenticate, ownerOrSuperAdmin, updateGymBranding);
router.put('/:id/suspend', authenticate, superAdminOnly, suspendGym);
router.delete('/:id', authenticate, superAdminOnly, deleteGym);

export default router;

