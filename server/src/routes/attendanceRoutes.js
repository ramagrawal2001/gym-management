import express from 'express';
import {
    getMyAttendance,
    getAttendance,
    getTodayAttendance,
    checkIn,
    checkOut,
    getMemberAttendance,
    checkInWithQR,
    generateQRCode,
    staffOverride,
    getReports,
    exportAttendance,
    importAttendance,
    getOverrideLogs
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope, enforceMemberScope } from '../middleware/gymScope.js';
import { memberOnly, ownerOnly, staffOrAbove } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(checkFeature('attendance'));

// Member-specific route (before enforceGymScope)
router.get('/me', memberOnly, enforceMemberScope, getMyAttendance);

// Other routes require gym scope
router.use(enforceGymScope);

// Basic attendance operations
router.get('/', getAttendance);
router.get('/today', getTodayAttendance);
router.get('/member/:memberId', getMemberAttendance);
router.post('/checkin', checkIn);
router.put('/checkout/:id', checkOut);

// QR-based check-in
router.post('/qr-checkin', checkInWithQR);
router.get('/qr/:memberId', generateQRCode);

// Staff override
router.post('/override', staffOrAbove, staffOverride);
router.get('/override-logs', ownerOnly, getOverrideLogs);

// Reports and Import/Export
router.get('/reports', staffOrAbove, getReports);
router.get('/export', staffOrAbove, exportAttendance);
router.post('/import', ownerOnly, importAttendance);

export default router;
