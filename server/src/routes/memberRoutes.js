import express from 'express';
import { getMembers, getMember, createMember, updateMember, renewMember, deleteMember } from '../controllers/memberController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceGymScope);

router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', staffOrAbove, createMember);
router.put('/:id', staffOrAbove, updateMember);
router.put('/:id/renew', staffOrAbove, renewMember);
router.delete('/:id', ownerOrSuperAdmin, deleteMember);

export default router;

