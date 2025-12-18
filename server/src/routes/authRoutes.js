import express from 'express';
import { register, login, requestOtp, verifyOtp, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', optionalAuthenticate, register);
router.post('/login', login);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;

