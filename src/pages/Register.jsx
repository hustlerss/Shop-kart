import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, loading, userInfo } = useContext(ShopContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  if (userInfo) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords don't match. Please re-enter.");
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    const result = await register(formData.name, formData.email, formData.password);
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
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-[2rem] font-bold text-primary">
              Shop<span className="text-accent">Kart</span>
            </Link>
            <h2 className="font-serif text-[1.6rem] font-bold text-primary mt-4 mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Join thousands of happy shoppers today</p>
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl mb-5">
              ⚠️ {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
              />
            </div>

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
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accentHover text-white font-bold py-4 rounded-xl text-base tracking-wide transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-accent/20 active:scale-95"
            >
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-accentHover font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
