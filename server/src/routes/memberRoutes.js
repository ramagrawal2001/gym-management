import express from 'express';
import { getMyProfile, getMembers, getMember, createMember, updateMember, renewMember, deleteMember } from '../controllers/memberController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope, enforceMemberScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin, memberOnly } from '../middleware/rbac.js';
import { uploadSingle } from '../middleware/upload.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// Member-specific route (before enforceGymScope)
router.get('/me', memberOnly, enforceMemberScope, getMyProfile);

// Other routes require gym scope
router.use(enforceGymScope);

router.get('/', getMembers);
router.get('/:id', getMember);
router.post('/', staffOrAbove, uploadSingle('profileImage'), createMember);
router.put('/:id', uploadSingle('profileImage'), updateMember); // Members can update their own profile
router.put('/:id/renew', staffOrAbove, renewMember);
router.delete('/:id', ownerOrSuperAdmin, deleteMember);

export default router;

