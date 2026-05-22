import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalSales || 0).toLocaleString()}`, icon: '💰', color: 'from-accent to-[#ff6b6b]', textColor: 'text-white' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'from-blue-500 to-blue-600', textColor: 'text-white' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🏪', color: 'from-green-500 to-green-600', textColor: 'text-white' },
    { label: 'Total Customers', value: stats?.totalUsers || 0, icon: '👤', color: 'from-gold to-yellow-500', textColor: 'text-white' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-[2rem]">{card.icon}</span>
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Live</span>
            </div>
            <div className={`${card.textColor}`}>
              <p className="text-[1.8rem] font-bold font-serif">{card.value}</p>
              <p className="text-white/80 text-sm font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 text-base mb-5 border-b border-gray-100 pb-3">📊 Inventory by Category</h3>
          {stats?.categoryStats?.length === 0 ? (
            <p className="text-sm text-gray-400">No category data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.categoryStats?.map((cat) => (
                <div key={cat._id} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-primary capitalize min-w-[110px]">{cat._id}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${Math.min(100, (cat.count / (stats?.totalProducts || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-right min-w-[80px]">
                    <span className="text-xs font-bold text-gray-700">{cat.count} items</span>
                    <span className="block text-[0.65rem] text-gray-400">{cat.stock} in stock</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Timeline */}
        <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 text-base mb-5 border-b border-gray-100 pb-3">📈 Recent Sales History</h3>
          {stats?.salesHistory?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No completed orders yet.</p>
              <p className="text-xs mt-1">Sales history will appear after customers make purchases.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.salesHistory?.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{entry._id}</p>
                    <p className="text-xs text-gray-400">{entry.count} orders</p>
                  </div>
                  <span className="text-sm font-bold text-accent">₹{entry.sales.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/admin/api/products" className="bg-primary text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-primary/90 transition-colors shadow-lg cursor-pointer">
          <span className="text-[2rem]">📦</span>
          <div>
            <p className="font-bold text-base">Manage Products</p>
            <p className="text-white/60 text-xs">Add, edit, or delete catalog items</p>
          </div>
        </a>
        <a href="/admin/orders" className="bg-accent text-white rounded-2xl p-5 flex items-center gap-4 hover:bg-accentHover transition-colors shadow-lg cursor-pointer">
          <span className="text-[2rem]">📋</span>
          <div>
            <p className="font-bold text-base">Manage Orders</p>
            <p className="text-white/60 text-xs">Update order delivery statuses</p>
          </div>
        </a>
        <a href="/admin/users" className="bg-gold text-primary rounded-2xl p-5 flex items-center gap-4 hover:bg-gold/90 transition-colors shadow-lg cursor-pointer">
          <span className="text-[2rem]">👥</span>
          <div>
            <p className="font-bold text-base">Manage Users</p>
            <p className="text-white/60 text-xs">View and moderate platform accounts</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
