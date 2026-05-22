import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/razorpayService.js';

// @desc    Create a new order & initiate Razorpay payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, totalAmount } = req.body;
  
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // 1. Double check stock availability
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.title}. Only ${product.stock} units left.` });
      }
    }

    // 2. Create the Razorpay Order
    const receiptId = `receipt_order_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder(totalAmount, receiptId);

    if (!razorpayOrder.success) {
      return res.status(500).json({ message: 'Error initiating payment gateway transaction' });
    }

    // 3. Create the Order in MongoDB as pending
    const order = new Order({
      user: req.user._id,
      products: orderItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      shippingAddress,
      paymentStatus: 'pending',
      paymentDetails: {
        razorpayOrderId: razorpayOrder.orderId,
      },
    });

    const createdOrder = await order.save();
    return res.status(201).json({
      success: true,
      order: createdOrder,
      razorpayOrder, // Includes orderId, amount, currency, mock state
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment & complete order
// @route   POST /api/orders/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order matching transaction ID not found' });
    }

    // Verify signature
    const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (isValid) {
      // 1. Update order payment & transaction details
      order.paymentStatus = 'paid';
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
      order.paymentDetails.razorpaySignature = razorpaySignature;
      await order.save();

      // 2. Decrement product stock levels
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // 3. Clear user's shopping cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { cartItems: [] });

      return res.json({ success: true, message: 'Payment verified and order finalized!', order });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('products.product').sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
