const Product = require('./product.model');

class ProductService {
  async createProduct(productData) {
    const product = await Product.create(productData);
    return product.populate('vendor', 'name email');
  }

  async getAllProducts({ page = 1, limit = 12, category, search, minPrice, maxPrice, sort }) {
    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };
    if (sort === 'popular') sortOption = { 'rating.count': -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('vendor', 'name location')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    return { products, total };
  }

  async getProductById(productId) {
    const product = await Product.findById(productId)
      .populate('vendor', 'name email phone location')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async updateProduct(productId, userId, userRole, updateData) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Check permission
    if (userRole !== 'admin' && product.vendor.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    Object.assign(product, updateData);
    await product.save();

    return product.populate('vendor', 'name email');
  }

  async deleteProduct(productId, userId, userRole) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Check permission
    if (userRole !== 'admin' && product.vendor.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    await product.deleteOne();
    return product;
  }

  async addReview(productId, reviewData) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      r => r.user.toString() === reviewData.user.toString()
    );

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Add review
    product.reviews.push(reviewData);

    // Update rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    return product.populate('reviews.user', 'name avatar');
  }
}

module.exports = new ProductService();
