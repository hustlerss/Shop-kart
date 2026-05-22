import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, loading, userInfo } = useContext(ShopContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Redirect if already logged in
  if (userInfo) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bgSoft flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-8 md:p-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-[2rem] font-bold text-primary">
              Shop<span className="text-accent">Kart</span>
            </Link>
            <h2 className="font-serif text-[1.6rem] font-bold text-primary mt-4 mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your account to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Your password..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accentHover text-white font-bold py-4 rounded-xl text-base tracking-wide transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials box */}
          <div className="mt-6 bg-bgSoft rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🔑 Demo Accounts</p>
            <div className="text-xs text-gray-500 space-y-1 font-mono">
              <div><span className="font-bold text-primary">User:</span> rohan@gmail.com / userpassword123</div>
              <div><span className="font-bold text-accent">Admin:</span> admin@shopkart.com / adminpassword123</div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:text-accentHover font-bold">
                Create one now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
