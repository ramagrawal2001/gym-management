import express from 'express';
import { getEquipment, getEquipmentItem, createEquipment, updateEquipment, recordService, deleteEquipment } from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { staffOrAbove, ownerOrSuperAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceGymScope);

router.get('/', getEquipment);
router.get('/:id', getEquipmentItem);
router.post('/', staffOrAbove, createEquipment);
router.put('/:id', staffOrAbove, updateEquipment);
router.put('/:id/service', staffOrAbove, recordService);
router.delete('/:id', ownerOrSuperAdmin, deleteEquipment);

export default router;

