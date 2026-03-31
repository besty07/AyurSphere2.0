import express from 'express';
import { getProfile, updateProfile, getAllUsers, sendOtp } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get profile
router.get('/profile', authMiddleware, getProfile);

// Get all users (Admin only)
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

// Update profile...
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateProfile);

// Send OTP
router.post('/send-otp', authMiddleware, sendOtp);

export default router;
