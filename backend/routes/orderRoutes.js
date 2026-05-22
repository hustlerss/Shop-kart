import express from 'express';
import { createOrder, verifyPayment, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder);
router.route('/verify')
  .post(protect, verifyPayment);
router.route('/mine')
  .get(protect, getMyOrders);

export default router;
