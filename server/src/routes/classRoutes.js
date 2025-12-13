import express from 'express';
import { getClasses, getClass, createClass, updateClass, bookClass, cancelBooking, deleteClass } from '../controllers/classController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceGymScope } from '../middleware/gymScope.js';
import { staffOrAbove } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceGymScope);

router.get('/', getClasses);
router.get('/:id', getClass);
router.post('/', staffOrAbove, createClass);
router.put('/:id', staffOrAbove, updateClass);
router.post('/:id/book', bookClass);
router.delete('/:id/book/:bookingId', cancelBooking);
router.delete('/:id', staffOrAbove, deleteClass);

export default router;

