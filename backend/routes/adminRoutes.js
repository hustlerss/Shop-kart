import express from 'express';
import {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getUsers,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply protect & admin to all admin routes for high security
router.use(protect, admin);

router.get('/stats', getDashboardStats);

router.post('/products', upload.single('image'), createProduct);
router.route('/products/:id')
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

router.route('/orders')
  .get(getOrders);
router.route('/orders/:id')
  .put(updateOrderStatus);

router.route('/users')
  .get(getUsers);
router.route('/users/:id')
  .delete(deleteUser);

export default router;
