import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { ordersAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';

const Profile = () => {
  const { userInfo, updateProfile, logout, loading } = useContext(ShopContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const [profileForm, setProfileForm] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    password: '',
    address: {
      street: userInfo?.address?.street || '',
      city: userInfo?.address?.city || '',
      state: userInfo?.address?.state || '',
      zip: userInfo?.address?.zip || '',
      country: userInfo?.address?.country || 'India',
    },
  });

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [userInfo]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await ordersAPI.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      name: profileForm.name,
      email: profileForm.email,
      address: profileForm.address,
    };
    if (profileForm.password) {
      updateData.password = profileForm.password;
    }
    await updateProfile(updateData);
    setProfileForm((prev) => ({ ...prev, password: '' }));
  };

  const handleAddressChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      address: { ...prev.address, [e.target.name]: e.target.value },
    }));
  };

  const statusColors = {
    Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
  };

  if (!userInfo) return null;

  return (
    <div className="bg-bgSoft min-h-screen py-10 px-[5%]">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-[2rem] font-bold text-primary">My Account</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, <strong className="text-primary">{userInfo.name}</strong></p>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="text-sm text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl font-semibold transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'orders'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          📋 My Orders
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'profile'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          👤 Edit Profile
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-premium border border-gray-100">
              <div className="text-[3.5rem] mb-4">📦</div>
              <h3 className="font-serif text-xl font-bold text-primary mb-2">No Orders Yet</h3>
              <p className="text-gray-400 text-sm mb-6">Looks like you haven't placed any orders yet.</p>
              <Link to="/products" className="bg-accent text-white font-bold px-8 py-3 rounded-full hover:bg-accentHover transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order ID</p>
                      <p className="font-mono text-xs font-bold text-primary">{order._id.slice(-10).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</p>
                      <p className="font-bold text-primary">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold border px-3 py-1 rounded-full ${statusColors[order.orderStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`text-xs font-bold border px-3 py-1 rounded-full ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4 divide-y divide-gray-50">
                    {order.products?.map((item) => (
                      <div key={item._id} className="py-3 flex items-center gap-4 first:pt-0 last:pb-0">
                        <div className="w-12 h-12 bg-bgSoft rounded-xl flex items-center justify-center text-[1.5rem] flex-shrink-0">
                          {item.product?.images?.[0]?.length <= 2 ? item.product.images[0] : '🛍️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">{item.product?.title || 'Product Removed'}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-sm text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE EDIT TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6 space-y-5">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-gray-100 pb-3">Personal Information</h3>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password (optional)</label>
              <input
                type="password"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans"
              />
            </div>

            <h3 className="font-serif text-lg font-bold text-primary border-b border-gray-100 pb-3 pt-4">Shipping Address</h3>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Street Address</label>
              <input
                type="text"
                name="street"
                value={profileForm.address.street}
                onChange={handleAddressChange}
                placeholder="123 Shopping Lane"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">City</label>
                <input type="text" name="city" value={profileForm.address.city} onChange={handleAddressChange} placeholder="City" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">State</label>
                <input type="text" name="state" value={profileForm.address.state} onChange={handleAddressChange} placeholder="State" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ZIP Code</label>
                <input type="text" name="zip" value={profileForm.address.zip} onChange={handleAddressChange} placeholder="560001" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                <input type="text" name="country" value={profileForm.address.country} onChange={handleAddressChange} placeholder="India" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent transition-all font-sans" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Account Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6">
              <h3 className="font-serif text-lg font-bold text-primary mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-400">Role</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${userInfo.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                    {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-400">Total Orders</span>
                  <span className="font-bold text-primary">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-400">Total Spent</span>
                  <span className="font-bold text-accent">
                    ₹{orders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {userInfo.role === 'admin' && (
              <Link to="/admin" className="block bg-primary text-white font-bold rounded-2xl p-6 text-center hover:bg-primary/90 transition-colors shadow-lg">
                <div className="text-[2rem] mb-2">⚙️</div>
                <div className="font-serif text-xl">Admin Dashboard</div>
                <div className="text-white/60 text-xs mt-1">Manage products, orders, and users</div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
