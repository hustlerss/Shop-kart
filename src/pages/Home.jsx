import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const Home = () => {
  const { products, loading, error, fetchProducts } = useContext(ShopContext);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState('all');
  const [activeSort, setActiveSort] = useState('default');
  const navigate = useNavigate();

  // Trigger search filters on backend
  useEffect(() => {
    const filters = {};
    if (activeCategory !== 'all') {
      filters.category = activeCategory;
    }
    if (activeTag !== 'all') {
      filters.tag = activeTag;
    }
    if (activeSort !== 'default') {
      filters.sort = activeSort;
    }
    fetchProducts(filters);
  }, [activeCategory, activeTag, activeSort]);

  const categories = [
    { name: 'all', label: 'All', icon: '🛍️', count: '24 items' },
    { name: 'electronics', label: 'Electronics', icon: '📱', count: '8 items' },
    { name: 'fashion', label: 'Fashion', icon: '👗', count: '6 items' },
    { name: 'home', label: 'Home & Garden', icon: '🏠', count: '5 items' },
    { name: 'sports', label: 'Sports', icon: '⚽', count: '5 items' },
  ];

  // Dummy Countdown Timer for Deals Section
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 34, seconds: 56 }; // reset
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-bgSoft pb-12">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-primary via-[#16213e] to-[#0f3460] text-white px-[5%] py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
        {/* Dynamic circular radial background accent */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-radial bg-accent/15 -top-[100px] -right-[100px] pointer-events-none blur-[60px]"></div>

        <div className="max-w-[520px] z-10 text-center md:text-left">
          <span className="inline-block bg-accent text-white text-[0.75rem] font-bold px-[14px] py-[5px] rounded-[20px] tracking-[1.5px] uppercase mb-[18px]">
            🔥 New Arrivals 2026
          </span>
          <h1 className="font-serif text-[2.5rem] md:text-[3.5rem] font-bold leading-[1.15] mb-4">
            Shop the <em className="text-gold font-serif not-italic">Best</em><br />Deals Online
          </h1>
          <p className="text-white/70 text-[1.05rem] leading-relaxed mb-[30px]">
            Discover thousands of premium products at unbeatable prices. Quality guaranteed, lightning-fast delivery, and hassle-free returns.
          </p>
          <div className="flex gap-4 justify-center md:justify-start flex-wrap">
            <Link
              to="/api/products"
              className="bg-accent border-2 border-accent hover:bg-transparent text-white hover:text-accent rounded-[30px] px-[30px] py-[13px] text-[0.95rem] font-bold tracking-[0.5px] scale-100 hover:scale-105 transition-all duration-200"
            >
              Shop Now →
            </Link>
            <Link
              to="/api/products?tag=sale"
              className="border-2 border-white/40 hover:border-gold text-white hover:text-gold rounded-[30px] px-[30px] py-[13px] text-[0.95rem] font-medium tracking-[0.5px] transition-all duration-200"
            >
              View Deals
            </Link>
          </div>
        </div>

        <div className="flex gap-9 z-10 justify-center md:justify-end flex-wrap">
          <div className="text-center">
            <div className="font-serif text-[2.5rem] md:text-[3.2rem] font-bold text-gold">10K+</div>
            <div className="text-white/60 text-[0.8rem] tracking-[0.5px] uppercase">Products</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-[2.5rem] md:text-[3.2rem] font-bold text-gold">50K+</div>
            <div className="text-white/60 text-[0.8rem] tracking-[0.5px] uppercase">Customers</div>
          </div>
          <div className="text-center">
            <div className="font-serif text-[2.5rem] md:text-[3.2rem] font-bold text-gold">4.8★</div>
            <div className="text-white/60 text-[0.8rem] tracking-[0.5px] uppercase">Rating</div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="px-[5%] pt-12">
        <div className="flex items-center justify-between mb-[22px]">
          <h2 className="font-serif text-[1.6rem] font-bold text-primary">
            Browse <span className="text-accent">Categories</span>
          </h2>
          <Link to="/api/products" className="text-accent hover:text-accentHover text-[0.88rem] font-bold tracking-[0.3px]">
            See All →
          </Link>
        </div>

        {/* Categories scrollable deck */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`rounded-2xl px-6 py-[18px] min-w-[130px] text-center cursor-pointer flex-shrink-0 transition-all duration-300 border-2 border-transparent scale-100 hover:scale-105 active:scale-95 ${
                activeCategory === cat.name
                  ? 'bg-accent text-white shadow-[0_8px_20px_rgba(233,69,96,0.3)]'
                  : 'bg-primary text-white hover:bg-accent'
              }`}
            >
              <div className="text-[1.8rem] mb-[6px]">{cat.icon}</div>
              <div className="text-[0.82rem] font-bold tracking-[0.3px]">{cat.label}</div>
              <div className={`text-[0.7rem] mt-[3px] ${activeCategory === cat.name ? 'text-white/80' : 'text-white/60'}`}>
                {cat.count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STUNNING DEALS COUNTDOWN BANNER ── */}
      <section className="px-[5%] pt-12">
        <div className="bg-gradient-to-r from-accent to-[#ff6b6b] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg relative overflow-hidden">
          <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-10 -left-10 blur-xl pointer-events-none"></div>
          
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1 rounded-full">Flash Deal of the Day</span>
            <h2 className="font-serif text-[2rem] md:text-[2.5rem] font-bold leading-tight">Super Deals Up to 50% Off!</h2>
            <p className="text-white/80 text-sm max-w-md">Grab your favorite items before they run out of stock. Unbeatable quality, custom rates.</p>
          </div>

          <div className="flex flex-col items-center gap-4 z-10">
            <div className="flex gap-3 text-primary font-bold">
              <div className="bg-white px-4 py-3 rounded-2xl text-center shadow-md min-w-[70px]">
                <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-[0.65rem] uppercase tracking-wider text-gray-400">Hours</div>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl text-center shadow-md min-w-[70px]">
                <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-[0.65rem] uppercase tracking-wider text-gray-400">Mins</div>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl text-center shadow-md min-w-[70px]">
                <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-[0.65rem] uppercase tracking-wider text-gray-400">Secs</div>
              </div>
            </div>
            <Link
              to="/api/products?tag=sale"
              className="bg-primary hover:bg-primary/95 text-white font-bold px-8 py-3 rounded-full text-sm scale-100 hover:scale-105 active:scale-95 transition-all duration-150"
            >
              Shop Flash Items →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ── */}
      <section className="px-[5%] py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-[1.6rem] font-bold text-primary">
            Featured <span className="text-accent">Products</span>
          </h2>
        </div>

        {/* Filter Selection Bar */}
        <div className="flex flex-wrap items-center gap-[10px] mb-[28px]">
          <span className="text-[0.85rem] text-gray-400 font-medium">Filter:</span>
          <button
            onClick={() => setActiveTag('all')}
            className={`rounded-[20px] px-4 py-[7px] text-[0.83rem] cursor-pointer transition-all duration-200 ${
              activeTag === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTag('sale')}
            className={`rounded-[20px] px-4 py-[7px] text-[0.83rem] cursor-pointer transition-all duration-200 ${
              activeTag === 'sale'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary hover:text-white'
            }`}
          >
            On Sale
          </button>
          <button
            onClick={() => setActiveTag('new')}
            className={`rounded-[20px] px-4 py-[7px] text-[0.83rem] cursor-pointer transition-all duration-200 ${
              activeTag === 'new'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary hover:text-white'
            }`}
          >
            New
          </button>

          {/* Sort selection */}
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="ml-auto rounded-[20px] border border-gray-200 bg-white text-gray-700 px-4 py-[7px] text-[0.83rem] outline-none cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Dynamic products list rendering */}
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow p-6">
            <p className="text-red-500 font-bold mb-2">Error connecting to server</p>
            <p className="text-xs text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="bg-primary text-white px-6 py-2 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow text-gray-400">
            <p className="font-semibold text-lg">No products found in this category.</p>
            <p className="text-sm">Please check back later or modify your active filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="px-[5%] py-12 border-t border-gray-100 bg-white/50">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-[1.6rem] font-bold text-primary">What Our Customers Say</h2>
          <p className="text-sm text-gray-400 mt-2">Hear directly from hundreds of satisfied buyers around the globe.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-50 flex flex-col">
            <div className="text-accent text-[2.5rem] leading-none mb-3 font-serif">“</div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
              Absolutely outstanding customer service! The headphones arrived inside a gorgeous box in under 24 hours. The sound quality is deep and perfectly balanced. High recommended!
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">SK</div>
              <div>
                <h4 className="font-bold text-sm text-primary">Samar Kohli</h4>
                <p className="text-xs text-gray-400">Verified Buyer</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-50 flex flex-col">
            <div className="text-accent text-[2.5rem] leading-none mb-3 font-serif">“</div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
              The premium sports shoes are remarkably comfortable! The return process is incredibly easy, but I definitely won't be returning these. Fits like a glove. 5 stars.
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">PS</div>
              <div>
                <h4 className="font-bold text-sm text-primary">Priya Sharma</h4>
                <p className="text-xs text-gray-400">Fitness Coach</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-50 flex flex-col">
            <div className="text-accent text-[2.5rem] leading-none mb-3 font-serif">“</div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
              I love the LED lamp! The adjustable colors and USB charger make it perfect for late-night study sessions. The MERN platform was fast and secure during checkout.
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">AD</div>
              <div>
                <h4 className="font-bold text-sm text-primary">Amit Dey</h4>
                <p className="text-xs text-gray-400">Software Developer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER SECTION ── */}
      <section className="px-[5%] pt-12">
        <div className="bg-primary text-white rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-xl relative overflow-hidden">
          <div className="absolute w-48 h-48 bg-accent/5 rounded-full -top-10 -right-10 blur-lg pointer-events-none"></div>
          <h2 className="font-serif text-[1.8rem] md:text-[2.2rem] font-bold mb-3">Join the ShopKart Club</h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-6">Subscribe to our weekly newsletter and receive a ₹500 discount coupon on your first premium transaction.</p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert('Successfully subscribed to newsletter! Check your inbox for your ₹500 coupon.');
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input 
              type="email" 
              placeholder="Enter your email address..."
              required
              className="flex-grow px-5 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 outline-none focus:bg-white/15 focus:border-white/40 transition-colors text-sm"
            />
            <button 
              type="submit"
              className="bg-accent hover:bg-accentHover text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
