import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const STATUS_OPTIONS = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColors = {
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus === filterStatus);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Filter and Count Header */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-400 font-medium mr-2">
          {filteredOrders.length} orders
        </p>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterStatus === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary'}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 text-left font-bold">Order ID</th>
              <th className="px-4 py-4 text-left font-bold">Customer</th>
              <th className="px-4 py-4 text-left font-bold">Items</th>
              <th className="px-4 py-4 text-left font-bold">Total</th>
              <th className="px-4 py-4 text-left font-bold">Payment</th>
              <th className="px-4 py-4 text-left font-bold">Date</th>
              <th className="px-4 py-4 text-left font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-bold text-primary">#{order._id.slice(-8).toUpperCase()}</span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-xs text-gray-800">{order.user?.name || 'Guest'}</p>
                  <p className="text-gray-400 text-[0.68rem]">{order.user?.email || ''}</p>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500 font-medium">
                  {order.products?.length || 0} items
                </td>
                <td className="px-4 py-4 font-bold text-primary text-xs">₹{order.totalAmount?.toLocaleString()}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-bold border px-2 py-1 rounded-full ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : order.paymentStatus === 'failed'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-4">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    className={`text-xs font-bold border rounded-lg px-2 py-1.5 cursor-pointer outline-none transition-colors ${statusColors[order.orderStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-[3rem] mb-3">📋</div>
            <p className="font-semibold">No orders found.</p>
            <p className="text-xs mt-1">
              {filterStatus !== 'all' ? `No orders with status "${filterStatus}".` : 'Orders will appear here after customers place them.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
