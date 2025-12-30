import express from 'express';
import { getEquipment, getEquipmentItem, createEquipment, updateEquipment, recordService, deleteEquipment } from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin } from '../middleware/rbac.js';
import { checkFeature } from '../middleware/featureGuard.js';
import { requireActiveSubscription } from '../middleware/subscriptionGuard.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);
router.use(checkFeature('inventory'));
router.use(enforceGymScope);

router.get('/', getEquipment);
router.get('/:id', getEquipmentItem);
router.post('/', staffOrAbove, createEquipment);
router.put('/:id', staffOrAbove, updateEquipment);
router.put('/:id/service', staffOrAbove, recordService);
router.delete('/:id', ownerOrSuperAdmin, deleteEquipment);

export default router;

