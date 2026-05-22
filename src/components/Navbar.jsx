import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveImageUrl } from '../services/api.js';

const Navbar = () => {
  const { cart, cartCount, cartTotal, updateQty, removeFromCart, userInfo, logout } = useContext(ShopContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchVal(query);
    if (location.pathname === '/products') {
      navigate(`/products?search=${query}`);
    } else {
      if (query.trim()) {
        navigate(`/products?search=${query}`);
      }
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* ── HEADER NAVBAR ── */}
      <header className="sticky top-0 bg-primary text-white h-[70px] px-[5%] flex items-center justify-between z-[100] shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
        <Link to="/" className="font-serif text-[1.7rem] font-bold tracking-[1px]">
          Shop<span className="text-accent">Kart</span>
        </Link>

        <nav className="hidden md:flex gap-7">
          <Link to="/" className="text-white/80 hover:text-gold text-[0.9rem] font-medium tracking-[0.5px] transition-colors duration-200">Home</Link>
          <Link to="/products" className="text-white/80 hover:text-gold text-[0.9rem] font-medium tracking-[0.5px] transition-colors duration-200">Products</Link>
          <Link to="/products?tag=sale" className="text-white/80 hover:text-gold text-[0.9rem] font-medium tracking-[0.5px] transition-colors duration-200">Deals</Link>
          <Link to="/profile" className="text-white/80 hover:text-gold text-[0.9rem] font-medium tracking-[0.5px] transition-colors duration-200">My Orders</Link>
        </nav>

        <div className="flex items-center gap-[18px]">
          {/* Search Input */}
          <input
            className="bg-white/10 border border-white/20 rounded-[20px] px-4 py-[7px] text-[0.85rem] text-white placeholder-white/50 outline-none w-[150px] sm:w-[180px] focus:w-[220px] focus:bg-white/15 transition-all duration-300"
            type="text"
            placeholder="Search products..."
            value={searchVal}
            onChange={handleSearchChange}
          />

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-accent hover:bg-accentHover rounded-[22px] text-white px-[18px] py-2 text-[0.9rem] font-semibold flex items-center gap-[7px] scale-100 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            🛒 <span className="hidden sm:inline">Cart</span>
            <span className="bg-gold text-primary rounded-full w-5 h-5 flex items-center justify-center text-[0.72rem] font-bold">
              {cartCount}
            </span>
          </button>

          {/* Auth System Dropdown */}
          <div className="relative">
            {userInfo ? (
              <div>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="bg-white/10 hover:bg-white/15 px-[14px] py-2 rounded-[20px] text-[0.85rem] font-semibold flex items-center gap-1 cursor-pointer transition-colors duration-200"
                >
                  👤 <span className="hidden sm:inline truncate max-w-[80px]">{userInfo.name}</span>
                </button>
                
                {isUserDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{userInfo.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        My Profile & Orders
                      </Link>

                      {userInfo.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-accent font-semibold hover:bg-gray-50 transition-colors"
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-transparent hover:bg-white/10 border border-white/40 hover:border-white/60 text-white rounded-[20px] px-[18px] py-[7px] text-[0.85rem] font-semibold transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── CART SIDEBAR DRAWER ── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-[200]"
            ></motion.div>

            {/* Sidebar Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 w-full sm:w-[380px] h-screen bg-white z-[201] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.15)]"
            >
              <div className="bg-primary text-white p-5 flex items-center justify-between">
                <div className="font-serif text-[1.25rem] flex items-center gap-2">🛒 My Cart</div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white hover:text-accent text-[1.4rem] opacity-80 hover:opacity-100 transition-all duration-200"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-[3.5rem] mb-3">🛒</div>
                    <p className="font-medium text-lg">Your cart is empty</p>
                    <Link
                      to="/products"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 inline-block text-accent hover:text-accentHover font-semibold text-sm underline"
                    >
                      Shop our products
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product._id} className="flex gap-4 py-3 border-b border-gray-100">
                      {/* Image render: emoji or web URL */}
                      <div className="w-[55px] h-[55px] bg-bgSoft border border-gray-100 rounded-xl flex items-center justify-center text-[2rem] flex-shrink-0">
                        {item.product.images?.[0]?.length <= 2 ? (
                          <span>{item.product.images[0]}</span>
                        ) : (
                          <img
                            src={resolveImageUrl(item.product.images[0])}
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-[0.9rem] truncate">{item.product.title}</div>
                        <div className="text-accent font-bold text-[0.95rem] mt-1">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.product._id, item.quantity - 1)}
                            className="w-[26px] h-[26px] border border-gray-200 hover:bg-primary hover:text-white hover:border-primary rounded-md flex items-center justify-center font-bold text-[0.9rem] transition-colors"
                          >
                            −
                          </button>
                          <span className="text-[0.9rem] font-semibold min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product._id, item.quantity + 1)}
                            className="w-[26px] h-[26px] border border-gray-200 hover:bg-primary hover:text-white hover:border-primary rounded-md flex items-center justify-center font-bold text-[0.9rem] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-gray-400 hover:text-accent self-start p-1 transition-colors duration-200"
                        title="Remove item"
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer Summary */}
              {cart.length > 0 && (
                <div className="p-5 border-t-2 border-gray-100 bg-white">
                  <div className="flex justify-between text-[0.85rem] text-gray-400 mb-2 font-medium">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[0.85rem] text-gray-400 mb-4 font-medium">
                    <span>Delivery</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-[1.15rem] font-bold text-gray-800 mb-4">
                    <span>Total Amount</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-accent hover:bg-accentHover text-white rounded-xl py-[14px] font-bold tracking-[0.5px] transition-colors"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
