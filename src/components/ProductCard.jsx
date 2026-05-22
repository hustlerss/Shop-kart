import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { resolveImageUrl } from '../services/api.js';

const ProductCard = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist } = useContext(ShopContext);
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  const isLiked = wishlist.includes(product._id);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    navigate(`/api/products/${product._id}`);
  };

  // Calculate standard old price based on discount
  const oldPrice = product.discount > 0 
    ? Math.round(product.price / (1 - product.discount / 100))
    : null;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden shadow-premium hover:shadow-cardHover -translate-y-0 hover:-translate-y-2 transition-all duration-300 relative cursor-pointer group flex flex-col h-full"
    >
      {/* Absolute Badges */}
      {product.badge && (
        <span className="absolute top-3 left-3 bg-accent text-white text-[0.7rem] font-bold px-[10px] py-[4px] rounded-xl z-10 tracking-[0.5px]">
          {product.badge}
        </span>
      )}
      
      {/* Wishlist Button */}
      <button 
        onClick={handleWish}
        className={`absolute top-3 right-3 bg-white border-none w-[34px] h-[34px] rounded-full flex items-center justify-center text-[1rem] shadow-[0_2px_8px_rgba(0,0,0,0.12)] z-10 scale-100 hover:scale-115 active:scale-90 transition-all duration-150 ${isLiked ? 'text-accent' : 'text-gray-400'}`}
        title="Wishlist"
      >
        {isLiked ? '❤️' : '🤍'}
      </button>

      {/* Product Image zoom container */}
      <div className="zoom-img-container h-[200px] w-full bg-gradient-to-br from-[#f0e8d8] to-[#e8dcc8] flex items-center justify-center relative">
        {product.images?.[0]?.length <= 2 ? (
          <span className="emoji-holder text-[4rem] filter drop-shadow">{product.images[0]}</span>
        ) : (
          <img 
            src={resolveImageUrl(product.images[0])}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[0.72rem] text-gray-400 uppercase tracking-[1px] mb-1">
          {product.category}
        </div>
        <h3 className="font-semibold text-[1rem] text-primary leading-snug group-hover:text-accent transition-colors duration-200 mb-2 truncate">
          {product.title}
        </h3>

        {/* Ratings block */}
        <div className="flex items-center gap-[6px] mb-3">
          <span className="text-gold text-[0.85rem] tracking-[1px]">
            {'★'.repeat(Math.floor(product.ratings?.rate || 0))}
            {'☆'.repeat(5 - Math.floor(product.ratings?.rate || 0))}
          </span>
          <span className="text-gray-400 text-[0.75rem]">
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </span>
            {oldPrice && (
              <span className="text-[0.82rem] text-gray-400 line-through">
                ₹{oldPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleAdd}
            className={`rounded-lg px-4 py-[9px] text-[0.82rem] font-semibold text-white transition-all duration-200 font-sans active:scale-95 ${
              isAdded 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-primary hover:bg-accent'
            }`}
          >
            {isAdded ? '✓ Added' : 'Add +'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
