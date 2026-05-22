import React, { useState, useEffect } from 'react';
import { adminAPI, productsAPI } from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const CATEGORIES = ['electronics', 'fashion', 'home', 'sports'];

const EMPTY_FORM = {
  title: '', description: '', category: 'electronics', brand: '', stock: '',
  price: '', discount: '', badge: '', emoji: ''
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productsAPI.getProducts({});
      setProducts(data);
    } catch (err) {
      console.error('Failed loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      price: product.price,
      discount: product.discount,
      badge: product.badge,
      emoji: product.images?.[0]?.length <= 2 ? product.images[0] : '',
    });
    setEditingId(product._id);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '') formData.append(key, val);
      });
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingId) {
        await adminAPI.updateProduct(editingId, formData);
      } else {
        await adminAPI.createProduct(formData);
      }
      setShowForm(false);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await adminAPI.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 font-medium">{products.length} products in catalog</p>
        <button
          onClick={openCreateForm}
          className="bg-accent hover:bg-accentHover text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer"
        >
          + Add New Product
        </button>
      </div>

      {/* Create/Edit Sliding Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-primary">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Wireless Headphones Pro" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows="3" placeholder="Detailed product description..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent resize-none font-sans" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent bg-white cursor-pointer">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand *</label>
                <input name="brand" value={form.brand} onChange={handleChange} required placeholder="SoundWave Pro" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" placeholder="1499" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stock Units *</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" placeholder="50" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Discount %</label>
                <input type="number" name="discount" value={form.discount} onChange={handleChange} min="0" max="99" placeholder="30" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Badge</label>
                <select name="badge" value={form.badge} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent bg-white cursor-pointer">
                  <option value="">No Badge</option>
                  <option value="NEW">NEW</option>
                  <option value="SALE">SALE</option>
                  <option value="HOT">HOT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Emoji Icon (if no image)</label>
                <input name="emoji" value={form.emoji} onChange={handleChange} placeholder="🎧" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Image File (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent font-sans file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-bold cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 hover:border-accent hover:text-accent font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-[2] bg-accent hover:bg-accentHover text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50">
                  {submitting ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Product</th>
              <th className="px-4 py-4 text-left font-bold">Category</th>
              <th className="px-4 py-4 text-left font-bold">Price</th>
              <th className="px-4 py-4 text-left font-bold">Stock</th>
              <th className="px-4 py-4 text-left font-bold">Badge</th>
              <th className="px-4 py-4 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bgSoft rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      {product.images?.[0]?.length <= 2 ? product.images[0] : '🛍️'}
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-xs max-w-[150px] truncate">{product.title}</p>
                      <p className="text-gray-400 text-[0.68rem]">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="capitalize text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{product.category}</span>
                </td>
                <td className="px-4 py-4 font-bold text-primary text-xs">
                  ₹{product.price.toLocaleString()}
                  {product.discount > 0 && (
                    <span className="ml-1 text-accent text-[0.65rem]">(-{product.discount}%)</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-bold ${product.stock < 5 ? 'text-red-500' : product.stock < 20 ? 'text-orange-500' : 'text-green-600'}`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="px-4 py-4">
                  {product.badge ? (
                    <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-1 rounded-lg">{product.badge}</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(product)}
                      className="text-xs font-bold text-primary border border-gray-200 hover:border-primary px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="text-xs font-bold text-red-500 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-semibold mb-2">No products in catalog yet.</p>
            <p className="text-xs">Click "Add New Product" to begin building your catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
