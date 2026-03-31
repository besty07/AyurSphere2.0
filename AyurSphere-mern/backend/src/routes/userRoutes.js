import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get profile
router.get('/profile', authMiddleware, getProfile);

// Update profile (allow multer to handle multipart/form-data for 'profilePicture')
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateProfile);

export default router;
