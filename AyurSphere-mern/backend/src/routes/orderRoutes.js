import express from 'express';
import { checkoutCart, getMyOrders, getAllOrders } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

// Finalize cart into Order and clear cart
router.post('/checkout', authMiddleware, checkoutCart);

// For profile/history functionality
router.get('/me', authMiddleware, getMyOrders);

// Admin: view all orders
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);

export default router;
