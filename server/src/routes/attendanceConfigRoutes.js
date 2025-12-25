import express from 'express';
import { getConfig, updateConfig, assignMethods, toggleAttendance, getConfigByGymId } from '../controllers/attendanceConfigController.js';
import { authenticate } from '../middleware/auth.js';
import { ownerOnly, superAdminOnly } from '../middleware/rbac.js';
import { enforceGymScope } from '../middleware/gymScope.js';

const router = express.Router();

router.use(authenticate);

// Owner/Staff routes
router.get('/', enforceGymScope, getConfig);
router.put('/', enforceGymScope, ownerOnly, updateConfig);
router.put('/toggle', enforceGymScope, ownerOnly, toggleAttendance);

// Super Admin routes
router.put('/methods', superAdminOnly, assignMethods);
router.get('/:gymId', superAdminOnly, getConfigByGymId);

export default router;
