import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';

const AdminLayout = () => {
  const { userInfo, showToast } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigate('/');
    }
  }, [userInfo, navigate]);

  if (!userInfo || userInfo.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bgSoft flex items-center justify-center">
        <p className="text-gray-500 font-semibold">Verifying credentials...</p>
      </div>
    );
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-bgSoft">
      {/* ── ADMIN SIDEBAR ── */}
      <aside className="w-[260px] bg-primary text-white flex flex-col flex-shrink-0 shadow-lg">
        {/* Header Branding */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="font-serif text-[1.5rem] font-bold tracking-[1px]">
            Shop<span className="text-accent">Kart</span> <span className="text-xs font-sans text-gold align-super">Admin</span>
          </Link>
          <p className="text-xs text-white/50 mt-1 truncate">Logged in as {userInfo.name}</p>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[0.9rem] font-medium transition-colors ${
              isActive('/admin') 
                ? 'bg-accent text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Analytics Dashboard
          </Link>
          
          <Link
            to="/admin/products"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[0.9rem] font-medium transition-colors ${
              isActive('/admin/products') 
                ? 'bg-accent text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            📦 Manage Products
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[0.9rem] font-medium transition-colors ${
              isActive('/admin/orders') 
                ? 'bg-accent text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            📋 Manage Orders
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[0.9rem] font-medium transition-colors ${
              isActive('/admin/users') 
                ? 'bg-accent text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            👤 Manage Users
          </Link>
        </nav>

        {/* Back to Client Store Button */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-[10px] rounded-lg text-sm font-semibold transition-colors"
          >
            ↩ Back to Shop
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[70px] bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm flex-shrink-0">
          <h1 className="font-semibold text-gray-800 text-lg">
            {isActive('/admin') && 'Control Analytics Dashboard'}
            {isActive('/admin/products') && 'Catalog Product Listings'}
            {isActive('/admin/orders') && 'Customer Order Records'}
            {isActive('/admin/users') && 'Registered Platform Users'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Role: <strong className="text-accent uppercase">Administrator</strong></span>
          </div>
        </header>

        {/* Dynamic Nested admin panels */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
