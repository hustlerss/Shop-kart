import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { ordersAPI } from '../services/api.js';

const Checkout = () => {
  const { cart, cartTotal, userInfo, clearCart, showToast } = useContext(ShopContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=Address, 2=Review, 3=Payment Success
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    zip: userInfo?.address?.zip || '',
    country: userInfo?.address?.country || 'India',
  });

  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      showToast('Please log in to proceed to checkout.', 'error');
      navigate('/login');
      return;
    }
    if (cart.length === 0 && step !== 3) {
      navigate('/products');
    }
  }, [userInfo, cart, step]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.zip) {
      showToast('Please fill in all required address fields.', 'error');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Step 1: Create order on server (gets Razorpay/Mock order ID)
      const { data: orderRes } = await ordersAPI.createOrder({
        orderItems,
        shippingAddress: address,
        totalAmount: cartTotal,
      });

      const { razorpayOrder, order: createdOrder } = orderRes;

      // Step 2: If mock mode, verify immediately with mock payment id
      if (razorpayOrder.mock) {
        const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
        const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 11)}`;

        const { data: verifyRes } = await ordersAPI.verifyPayment({
          razorpayOrderId: razorpayOrder.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        });

        if (verifyRes.success) {
          clearCart();
          setCompletedOrder(verifyRes.order);
          setStep(3);
          showToast('🎉 Order placed successfully!', 'success');
        }
      } else {
        // REAL Razorpay Payment Flow
        const razorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'ShopKart',
          description: 'Your Premium Shopping Order',
          order_id: razorpayOrder.orderId,
          handler: async function (response) {
            try {
              const { data: verifyRes } = await ordersAPI.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                clearCart();
                setCompletedOrder(verifyRes.order);
                setStep(3);
                showToast('🎉 Order placed successfully!', 'success');
              }
            } catch (err) {
              showToast('Payment verification failed. Please contact support.', 'error');
            }
          },
          prefill: {
            name: userInfo.name,
            email: userInfo.email,
          },
          theme: { color: '#e94560' },
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.on('payment.failed', () => {
          showToast('Payment failed. Please try again.', 'error');
        });
        rzp.open();
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      showToast(err.response?.data?.message || 'Failed to create order. Please try again.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (step === 3 && completedOrder) {
    return (
      <div className="min-h-screen bg-bgSoft flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[2.5rem]">✅</span>
          </div>
          <h2 className="font-serif text-[2rem] font-bold text-primary mb-2">Order Confirmed!</h2>
          <p className="text-gray-400 text-sm mb-4">
            Thank you for shopping with ShopKart! Your order has been placed and is now being processed.
          </p>
          <div className="bg-bgSoft rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Order Reference</p>
            <p className="font-mono text-sm font-bold text-primary">{completedOrder._id.slice(-12).toUpperCase()}</p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/profile"
              className="bg-primary hover:bg-accent text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="border border-gray-200 hover:border-accent text-gray-600 hover:text-accent font-bold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgSoft min-h-screen py-10 px-[5%]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-bold text-primary">Checkout</h1>
        <div className="flex items-center gap-2 mt-3 text-sm">
          <span className={`px-4 py-1 rounded-full font-semibold ${step >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>1. Address</span>
          <div className={`h-[2px] w-10 rounded ${step >= 2 ? 'bg-accent' : 'bg-gray-200'}`}></div>
          <span className={`px-4 py-1 rounded-full font-semibold ${step >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>2. Review & Pay</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Steps */}
        <div className="lg:col-span-2">
          {/* STEP 1: Address */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6 space-y-5">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-gray-100 pb-3">Shipping Address</h2>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Street Address *</label>
                <input name="street" value={address.street} onChange={handleAddressChange} required placeholder="123 Main Street, Apt 4B" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">City *</label>
                  <input name="city" value={address.city} onChange={handleAddressChange} required placeholder="Bengaluru" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">State *</label>
                  <input name="state" value={address.state} onChange={handleAddressChange} required placeholder="Karnataka" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">PIN / ZIP Code *</label>
                  <input name="zip" value={address.zip} onChange={handleAddressChange} required placeholder="560034" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                  <input name="country" value={address.country} onChange={handleAddressChange} placeholder="India" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
                </div>
              </div>

              <button type="submit" className="w-full bg-accent hover:bg-accentHover text-white font-bold py-4 rounded-xl transition-colors cursor-pointer">
                Continue to Review →
              </button>
            </form>
          )}

          {/* STEP 2: Order Review & Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6 space-y-5">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-gray-100 pb-3">Review Your Order</h2>

              <div className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <div key={item.product._id} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 bg-bgSoft rounded-xl flex items-center justify-center text-[2rem] flex-shrink-0">
                      {item.product.images?.[0]?.length <= 2 ? item.product.images[0] : '🛍️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{item.product.title}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.product.price.toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-primary">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="bg-bgSoft rounded-xl p-4 border border-gray-100 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery to:</p>
                <p className="text-sm font-semibold text-primary">{address.street}, {address.city}, {address.state} - {address.zip}, {address.country}</p>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 hover:border-accent hover:text-accent font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                  ← Edit Address
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="flex-[2] bg-accent hover:bg-accentHover text-white font-bold py-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-lg shadow-accent/20"
                >
                  {placing ? 'Processing Payment...' : `Pay ₹${cartTotal.toLocaleString()} Now 🔒`}
                </button>
              </div>

              <p className="text-xs text-center text-gray-400">
                🔒 Secured by Razorpay. UPI, Cards & Net Banking accepted.
              </p>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6 h-fit">
          <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b border-gray-100 pb-3">Order Summary</h3>

          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Items ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>GST</span>
              <span className="text-green-600 font-bold">Included</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-primary text-lg border-t border-gray-100 pt-4">
            <span>Total</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>

          <div className="mt-5 bg-green-50 rounded-xl p-3 text-xs text-green-700 font-medium border border-green-100">
            ✅ Free delivery + Easy 30-day returns included
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
