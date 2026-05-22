import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white/70 text-center py-7 px-[5%] text-[0.85rem] mt-auto">
      <div className="flex justify-center gap-6 mb-3 flex-wrap text-[0.83rem]">
        <a href="#" className="hover:text-gold transition-colors duration-200">Privacy Policy</a>
        <a href="#" className="hover:text-gold transition-colors duration-200">Terms of Use</a>
        <a href="#" className="hover:text-gold transition-colors duration-200">Shipping Info</a>
        <a href="#" className="hover:text-gold transition-colors duration-200">Returns</a>
        <a href="#" className="hover:text-gold transition-colors duration-200">Support</a>
      </div>
      <p>
        © 2026 <strong className="text-gold">ShopKart</strong> — Built with MERN Stack | Developed with Premium Care
      </p>
    </footer>
  );
};

export default Footer;
