import express from 'express';
import { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { ownerOrSuperAdmin } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('staff'));
router.use(enforceGymScope);

router.get('/', getStaff);
router.get('/:id', getStaffMember);
router.post('/', ownerOrSuperAdmin, createStaff);
router.put('/:id', ownerOrSuperAdmin, updateStaff);
router.delete('/:id', ownerOrSuperAdmin, deleteStaff);

export default router;

