import express from 'express';
import { getAttendance, getTodayAttendance, checkIn, checkOut, getMemberAttendance } from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceGymScope);

router.get('/', getAttendance);
router.get('/today', getTodayAttendance);
router.get('/member/:memberId', getMemberAttendance);
router.post('/checkin', checkIn);
router.put('/checkout/:id', checkOut);

export default router;

