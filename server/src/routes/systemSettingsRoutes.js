import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { getSystemSettings, updateSystemSettings } from '../controllers/systemSettingsController.js';

const router = express.Router();

// GET settings (publicly accessible or just globally authenticated for UI rendering limits)
router.get('/', authenticate, getSystemSettings);

// PUT update settings (Super Admin Only)
router.put('/', authenticate, authorize('super_admin'), updateSystemSettings);

export default router;
