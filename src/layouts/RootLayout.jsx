import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { ShopContext } from '../context/ShopContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';

const RootLayout = () => {
  const { toast } = useContext(ShopContext);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Header & Drawer */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-grow min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>

      {/* Footer Area */}
      <Footer />

      {/* Global CSS Reference Toast Box */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-7 right-7 bg-primary text-white px-5 py-[13px] rounded-xl shadow-2xl flex items-center gap-3 z-[300] border-l-4 border-accent"
          >
            <span className="text-[1.1rem]">
              {toast.type === 'error' ? '❌' : '✅'}
            </span>
            <span className="text-[0.88rem] font-medium">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RootLayout;
