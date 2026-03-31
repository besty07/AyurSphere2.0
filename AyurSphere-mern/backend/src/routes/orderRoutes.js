import express from 'express';
import { checkoutCart, getMyOrders } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Finalize cart into Order and clear cart
router.post('/checkout', authMiddleware, checkoutCart);

// For profile/history functionality
router.get('/me', authMiddleware, getMyOrders);

export default router;
