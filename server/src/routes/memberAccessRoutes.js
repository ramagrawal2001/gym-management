import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import {
    getGymSettings,
    updateGymSettings,
    getMemberAccess,
    updateMemberAccess,
    bulkUpdateMemberAccess
} from '../controllers/memberAccessController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Gym-level settings (owner/super_admin only)
router.get('/gym-settings', authorize('super_admin', 'owner'), getGymSettings);
router.put('/gym-settings', authorize('super_admin', 'owner'), updateGymSettings);

// Individual member access (owner/super_admin only)
router.get('/member/:memberId', authorize('super_admin', 'owner', 'staff'), getMemberAccess);
router.put('/member/:memberId', authorize('super_admin', 'owner'), updateMemberAccess);

// Bulk update (owner/super_admin only)
router.post('/bulk', authorize('super_admin', 'owner'), bulkUpdateMemberAccess);

export default router;
