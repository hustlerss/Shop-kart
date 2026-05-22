import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { uploadImage } from '../services/cloudinaryService.js';

// @desc    Get dashboard analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Total Sales & Total Orders
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalOrders = await Order.countDocuments();
    const totalSales = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Categories inventory breakdown
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, stock: { $sum: '$stock' } } },
    ]);

    // Sales timeline history for graph
    const salesHistory = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 10 },
    ]);

    return res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalSales,
      categoryStats,
      salesHistory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { title, description, category, brand, stock, price, discount, badge } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    } else {
      imageUrl = req.body.emoji || '🛍️'; // fallback emoji icon
    }

    const product = new Product({
      title,
      description,
      images: [imageUrl],
      category: category.toLowerCase(),
      brand,
      stock: Number(stock),
      price: Number(price),
      discount: Number(discount || 0),
      badge: badge || '',
      ratings: { rate: 0, count: 0 },
    });

    const createdProduct = await product.save();
    return res.status(201).json(createdProduct);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = req.body.title || product.title;
      product.description = req.body.description || product.description;
      product.category = (req.body.category || product.category).toLowerCase();
      product.brand = req.body.brand || product.brand;
      product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
      product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
      product.discount = req.body.discount !== undefined ? Number(req.body.discount) : product.discount;
      product.badge = req.body.badge !== undefined ? req.body.badge : product.badge;

      if (req.file) {
        const imageUrl = await uploadImage(req.file);
        product.images = [imageUrl];
      }

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      return res.json({ message: 'Product removed' });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('products.product')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.orderStatus = req.body.orderStatus || order.orderStatus;
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete admin account' });
      }
      await user.deleteOne();
      return res.json({ message: 'User removed successfully' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
