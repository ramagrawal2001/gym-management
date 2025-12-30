import express from 'express';
import { getAvailableClasses, getClasses, getClass, createClass, updateClass, bookClass, cancelBooking, deleteClass } from '../controllers/classController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope, enforceMemberScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin, memberOnly } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);
router.use(checkFeature('scheduling'));

// Member-specific routes (before enforceGymScope)
router.get('/available', memberOnly, enforceMemberScope, getAvailableClasses);

// Other routes require gym scope
router.use(enforceGymScope);

router.get('/', getClasses);
router.get('/:id', getClass);
router.post('/', staffOrAbove, createClass);
router.put('/:id', updateClass); // Members cannot update, but staff can update assigned classes
router.post('/:id/book', bookClass); // Members and staff can book
router.delete('/:id/book/:bookingId', cancelBooking); // Members and staff can cancel
router.delete('/:id', ownerOrSuperAdmin, deleteClass);

export default router;

