import Cart from '../models/Cart.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, cartItems: [] });
    }
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Sync / Save user cart items
// @route   POST /api/cart
// @access  Private
export const syncCart = async (req, res) => {
  const { cartItems } = req.body; // Array of { product: id, quantity: n }
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, cartItems: [] });
    }
    
    // Map items safely, filtering out items that are incomplete
    cart.cartItems = cartItems
      .filter(item => item.product)
      .map(item => ({
        product: item.product,
        quantity: item.quantity || 1,
      }));
      
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');
    return res.json(updatedCart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
