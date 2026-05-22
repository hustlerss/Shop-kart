import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import { productsAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist, userInfo, showToast } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Active gallery image
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productsAPI.getProductById(id);
      setProductData(data.product);
      setRelated(data.relatedProducts);
      setActiveImage(data.product.images?.[0] || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    setQty(1); // reset quant on detail view change
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter a review comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await productsAPI.createReview(id, { rating, comment });
      showToast('Review added successfully!', 'success');
      setComment('');
      setRating(5);
      // Reload product details to show new review
      fetchProductDetails();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit review';
      showToast(errMsg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;

  if (error || !productData) {
    return (
      <div className="bg-bgSoft min-h-[50vh] flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="text-[3.5rem] mb-4">⚠️</div>
        <h2 className="font-serif text-2xl font-bold text-primary mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">{error || 'The product you are looking for does not exist.'}</p>
        <Link to="/products" className="bg-accent text-white font-bold px-8 py-3 rounded-full shadow hover:bg-accentHover">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isLiked = wishlist.includes(productData._id);
  const oldPrice = productData.discount > 0 
    ? Math.round(productData.price / (1 - productData.discount / 100))
    : null;

  return (
    <div className="bg-bgSoft min-h-screen py-10 px-[5%]">
      {/* ── BREADCRUMBS ── */}
      <div className="text-xs text-gray-400 mb-6 font-medium">
        <Link to="/" className="hover:text-primary">Home</Link> &gt;{' '}
        <Link to="/products" className="hover:text-primary">Products</Link> &gt;{' '}
        <span className="text-gray-600">{productData.title}</span>
      </div>

      {/* ── DETAILED ROW CONTAINER ── */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-premium border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="w-full h-[320px] md:h-[450px] bg-gradient-to-br from-[#f0e8d8] to-[#e8dcc8] rounded-2xl flex items-center justify-center text-[8rem] relative border border-gray-100 overflow-hidden shadow-inner">
            {activeImage?.length <= 2 ? (
              <span className="filter drop-shadow-md">{activeImage}</span>
            ) : (
              <img 
                src={`http://localhost:5000${activeImage}`.startsWith('http://localhost:5000/uploads') ? `http://localhost:5000${activeImage}` : activeImage}
                alt={productData.title} 
                className="w-full h-full object-cover"
              />
            )}
            
            {productData.badge && (
              <span className="absolute top-4 left-4 bg-accent text-white font-bold text-[0.8rem] px-4 py-[6px] rounded-xl tracking-wider uppercase">
                {productData.badge}
              </span>
            )}
          </div>

          {/* Multi-image indicator deck */}
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {productData.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-[65px] h-[65px] bg-bgSoft border rounded-xl flex items-center justify-center text-[1.8rem] cursor-pointer flex-shrink-0 transition-all ${
                  activeImage === img ? 'border-accent ring-2 ring-accent/30' : 'border-gray-200'
                }`}
              >
                {img.length <= 2 ? (
                  <span>{img}</span>
                ) : (
                  <img 
                    src={`http://localhost:5000${img}`.startsWith('http://localhost:5000/uploads') ? `http://localhost:5000${img}` : img} 
                    alt={productData.title} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs uppercase text-accent font-bold tracking-[1.5px]">
              {productData.category}
            </span>
            <button
              onClick={() => toggleWishlist(productData)}
              className={`text-xl bg-bgSoft border border-gray-100 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all ${
                isLiked ? 'text-accent' : 'text-gray-400'
              }`}
              title="Add to Wishlist"
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
          </div>

          <h2 className="font-serif text-[1.8rem] md:text-[2.5rem] font-bold text-primary leading-tight mb-4">
            {productData.title}
          </h2>

          {/* Ratings Summary */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-gold text-[1.1rem]">
                {'★'.repeat(Math.floor(productData.ratings?.rate || 0))}
                {'☆'.repeat(5 - Math.floor(productData.ratings?.rate || 0))}
              </span>
              <span className="text-sm font-bold text-gray-800 ml-1">
                {productData.ratings?.rate || 0}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400 font-medium">
              {productData.ratings?.count || 0} reviews verified
            </span>
          </div>

          {/* Price group */}
          <div className="space-y-2 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-[2rem] font-bold text-primary">
                ₹{productData.price.toLocaleString()}
              </span>
              {oldPrice && (
                <span className="text-[1.1rem] text-gray-400 line-through">
                  ₹{oldPrice.toLocaleString()}
                </span>
              )}
              {productData.discount > 0 && (
                <span className="bg-red-50 text-accent font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
                  {productData.discount}% Off
                </span>
              )}
            </div>
            
            {/* Stock Availability Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stock Availability:</span>
              {productData.stock === 0 ? (
                <span className="text-red-500 font-bold text-xs bg-red-50 px-3 py-1 rounded-md">Out of Stock</span>
              ) : productData.stock < 10 ? (
                <span className="text-orange-500 font-bold text-xs bg-orange-50 px-3 py-1 rounded-md">
                  Only {productData.stock} units left!
                </span>
              ) : (
                <span className="text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-md">In Stock</span>
              )}
            </div>
          </div>

          <div className="space-y-4 border-b border-gray-100 pb-6 mb-6">
            <h4 className="font-bold text-gray-800 text-sm">Product Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed font-sans">{productData.description}</p>
          </div>

          {/* Quantity selector & Add Button */}
          {productData.stock > 0 && (
            <div className="flex flex-wrap items-center gap-4 mt-auto">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-bgSoft">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 font-bold hover:bg-gray-200 transition-colors"
                >
                  −
                </button>
                <span className="px-4 font-bold text-sm min-w-[40px] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(productData.stock, q + 1))}
                  className="px-4 py-3 font-bold hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(productData, qty)}
                className="flex-1 bg-accent hover:bg-accentHover text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-accent/20 transition-all duration-200 scale-100 hover:scale-[1.02] active:scale-95"
              >
                Add {qty} to Cart 🛒
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── REVIEWS & RATING BLOCK ── */}
      <section className="bg-white rounded-3xl p-6 md:p-10 shadow-premium border border-gray-100 mb-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Reviews log */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-[1.4rem] font-bold text-primary mb-4 border-b border-gray-100 pb-3">
            Customer Reviews ({productData.reviews?.length || 0})
          </h3>

          {productData.reviews?.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-sans">
              <div className="text-[2.5rem] mb-2">💬</div>
              <p>No reviews submitted for this product yet.</p>
              <p className="text-xs">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-gray-100 max-h-[450px] overflow-y-auto no-scrollbar">
              {productData.reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="font-bold text-sm text-gray-800">{rev.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(rev.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-gold text-xs tracking-wider mb-2">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Add new review form */}
        <div className="bg-bgSoft p-6 rounded-2xl border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-800 text-base mb-4 border-b border-gray-200 pb-2">
            Write a Review
          </h3>

          {userInfo ? (
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-accent font-semibold cursor-pointer"
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Terrible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Review</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent resize-none font-sans"
                  placeholder="Share details of your experience with this item..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 text-gray-400 space-y-3 font-sans">
              <p className="text-xs">You must be logged in to submit a rating.</p>
              <Link
                to="/login"
                className="inline-block bg-primary hover:bg-accent text-white font-bold px-6 py-2 rounded-xl text-xs transition-colors"
              >
                Log In Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── RELATED PRODUCTS RECOMMENDATIONS ── */}
      {related.length > 0 && (
        <section>
          <h3 className="font-serif text-[1.6rem] font-bold text-primary mb-6">
            Related <span className="text-accent">Products</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
