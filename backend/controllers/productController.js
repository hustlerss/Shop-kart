import Product from '../models/Product.js';

// @desc    Fetch all products with sorting & filtering
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, tag, search, sort, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    
    // Badge / tag filter (e.g. tag = sale, new)
    if (tag && tag !== 'all') {
      if (tag === 'sale') {
        query.badge = 'SALE';
      } else if (tag === 'new') {
        query.badge = 'NEW';
      } else if (tag === 'hot') {
        query.badge = 'HOT';
      }
    }
    
    // Price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    let apiQuery = Product.find(query);
    
    // Sorting
    if (sort) {
      if (sort === 'low') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sort === 'high') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        apiQuery = apiQuery.sort({ 'ratings.rate': -1 });
      } else {
        apiQuery = apiQuery.sort({ createdAt: -1 }); // default
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }
    
    const products = await apiQuery;
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Find related products (same category, excluding current product)
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
      }).limit(4);
      
      return res.json({ product, relatedProducts });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/review
// @access  Private
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }
      
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };
      
      product.reviews.push(review);
      product.ratings.count = product.reviews.length;
      
      // Calculate average rating
      const sum = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.ratings.rate = Math.round((sum / product.reviews.length) * 10) / 10;
        
      await product.save();
      return res.status(201).json({ message: 'Review added successfully', product });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
