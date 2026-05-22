import { createContext, useState, useEffect } from 'react';
import { authAPI, productsAPI, cartAPI } from '../services/api.js';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // User Auth State
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null
  );

  // Cart and Wishlist states
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(
    localStorage.getItem('wishlist')
      ? JSON.parse(localStorage.getItem('wishlist'))
      : []
  );

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 1. Toast triggering utility
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // 2. Fetch products from DB
  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productsAPI.getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // 3. User Auth Handlers
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast(`Welcome back, ${data.name}!`, 'success');
      
      // Fetch user's cart from DB and merge
      fetchUserCart();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid email or password';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, password });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast(`Account created! Welcome, ${data.name}.`, 'success');
      
      // Initialize their cart in database
      await cartAPI.syncCart([]);
      setCart([]);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserInfo(null);
    setCart([]);
    localStorage.removeItem('userInfo');
    showToast('Logged out successfully.', 'success');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileData);
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast('Profile updated successfully!', 'success');
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // 4. Cart Handlers
  const fetchUserCart = async () => {
    if (!userInfo) return;
    try {
      const { data } = await cartAPI.getCart();
      // data.cartItems = Array of { product: {...}, quantity }
      const formattedItems = data.cartItems
        .filter(item => item.product)
        .map(item => ({
          product: item.product,
          quantity: item.quantity,
        }));
      setCart(formattedItems);
    } catch (err) {
      console.error('Error fetching cart from DB:', err);
    }
  };

  const syncCartToDB = async (items) => {
    if (!userInfo) return;
    try {
      const body = items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      }));
      await cartAPI.syncCart(body);
    } catch (err) {
      console.error('Error syncing cart to database:', err);
    }
  };

  const addToCart = (product, qty = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      let updatedCart;
      
      if (existing) {
        updatedCart = prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        updatedCart = [...prevCart, { product, quantity: qty }];
      }
      
      // Sync in background
      syncCartToDB(updatedCart);
      return updatedCart;
    });
    
    const icon = product.images?.[0] || '🛍️';
    showToast(`${icon} ${product.title} added to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.product._id !== productId);
      syncCartToDB(updatedCart);
      return updatedCart;
    });
    showToast('Item removed from cart.', 'success');
  };

  const updateQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQty }
          : item
      );
      syncCartToDB(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (userInfo) {
      cartAPI.syncCart([]);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // 5. Wishlist Handlers
  const toggleWishlist = (product) => {
    const productId = product._id;
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
      showToast('Removed from wishlist.', 'success');
    } else {
      updated = [...wishlist, productId];
      const icon = product.images?.[0] || '❤️';
      showToast(`${icon} Added to wishlist!`, 'success');
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  // Sync wishlist to local storage on change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Load products and cart on initialization/session changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
      if (userInfo) {
        fetchUserCart();
      } else {
        setCart([]); // reset cart if user logs out
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [userInfo]);

  return (
    <ShopContext.Provider
      value={{
        products,
        loading,
        error,
        userInfo,
        cart,
        wishlist,
        toast,
        cartCount,
        cartTotal,
        showToast,
        fetchProducts,
        login,
        register,
        logout,
        updateProfile,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
