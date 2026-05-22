import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const Products = () => {
  const { products, loading, error, fetchProducts } = useContext(ShopContext);
  const location = useLocation();

  // Parsing filters from query params
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('search') || '';
  const tagParam = queryParams.get('tag') || 'all';

  const [category, setCategory] = useState('all');
  const [tag, setTag] = useState(tagParam);
  const [sort, setSort] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [localSearch, setLocalSearch] = useState(searchParam);

  // Sync state with URL search param changes
  useEffect(() => {
    setLocalSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setTag(tagParam);
  }, [tagParam]);

  // Trigger API fetch on changes
  useEffect(() => {
    const filters = {};
    if (category !== 'all') filters.category = category;
    if (tag !== 'all') filters.tag = tag;
    if (sort !== 'default') filters.sort = sort;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (localSearch) filters.search = localSearch;

    fetchProducts(filters);
  }, [category, tag, sort, localSearch]);

  const handleApplyPrice = (e) => {
    e.preventDefault();
    // Trigger useEffect reload by recreating filters
    fetchProducts({
      category: category !== 'all' ? category : undefined,
      tag: tag !== 'all' ? tag : undefined,
      sort: sort !== 'default' ? sort : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      search: localSearch || undefined,
    });
  };

  const handleResetFilters = () => {
    setCategory('all');
    setTag('all');
    setSort('default');
    setMinPrice('');
    setMaxPrice('');
    setLocalSearch('');
  };

  const categories = [
    { value: 'all', label: '🛍️ All Categories' },
    { value: 'electronics', label: '📱 Electronics' },
    { value: 'fashion', label: '👗 Fashion' },
    { value: 'home', label: '🏠 Home & Garden' },
    { value: 'sports', label: '⚽ Sports' },
  ];

  return (
    <div className="bg-bgSoft min-h-screen py-10 px-[5%]">
      {/* ── BREADCRUMBS & HEADER ── */}
      <div className="mb-8">
        <div className="text-xs text-gray-400 mb-2 font-medium">
          Home &gt; <span className="text-gray-600">Browse Catalog</span>
        </div>
        <h1 className="font-serif text-[2.2rem] font-bold text-primary">
          Browse Our <span className="text-accent">Catalog</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── LEFT SIDEBAR FILTERS ── */}
        <aside className="w-full lg:w-[280px] bg-white rounded-2xl p-6 shadow-premium h-fit border border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h3 className="font-bold text-gray-800 text-base">🔍 Filters</h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-accent hover:text-accentHover underline"
            >
              Reset All
            </button>
          </div>

          {/* Search bar inside filters for mobile convenience */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search Catalog</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-accent outline-none"
              placeholder="Type keywords..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          {/* Categories select list */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-primary text-white font-semibold'
                      : 'text-gray-600 hover:bg-bgSoft hover:text-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filtering (Sales/New/Hot) */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Campaign Tags</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'sale', 'new', 'hot'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-[6px] rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all duration-150 ${
                    tag === t
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-accent hover:text-accent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</label>
            <form onSubmit={handleApplyPrice} className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min (₹)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-accent"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-300 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max (₹)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-accent"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-accent text-white rounded-xl py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Apply Range
              </button>
            </form>
          </div>
        </aside>

        {/* ── RIGHT PRODUCTS GRID & SORT ── */}
        <section className="flex-1">
          <div className="bg-white rounded-2xl p-4 shadow-premium border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-gray-500">
              Showing <strong className="text-primary">{products.length}</strong> items
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white text-gray-700 px-4 py-2 text-xs outline-none font-semibold cursor-pointer"
              >
                <option value="default">Default Date</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow p-6">
              <p className="text-red-500 font-bold mb-2">Failed to reach local server API</p>
              <p className="text-xs text-gray-400">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow text-gray-400 p-8">
              <p className="font-semibold text-lg mb-2">No matching products found.</p>
              <p className="text-sm mb-4">Try clearing some filters or searching for something else.</p>
              <button
                onClick={handleResetFilters}
                className="bg-accent hover:bg-accentHover text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;
