import express from 'express';
import { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('staff'));
router.use(enforceGymScope);

router.get('/', getStaff);
router.get('/:id', getStaffMember);
router.post('/', ownerOrSuperAdmin, uploadSingle('profileImage'), createStaff);
router.put('/:id', ownerOrSuperAdmin, uploadSingle('profileImage'), updateStaff);
router.delete('/:id', ownerOrSuperAdmin, deleteStaff);

export default router;

