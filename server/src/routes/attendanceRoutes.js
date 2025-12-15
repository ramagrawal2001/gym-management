import express from 'express';
import { getMyAttendance, getAttendance, getTodayAttendance, checkIn, checkOut, getMemberAttendance } from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope, enforceMemberScope } from '../middleware/gymScope.js';
import { memberOnly } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('attendance'));

// Member-specific route (before enforceGymScope)
router.get('/me', memberOnly, enforceMemberScope, getMyAttendance);

// Other routes require gym scope
router.use(enforceGymScope);

router.get('/', getAttendance);
router.get('/today', getTodayAttendance);
router.get('/member/:memberId', getMemberAttendance);
router.post('/checkin', checkIn);
router.put('/checkout/:id', checkOut);

export default router;

