const Product = require('./product.model');
const Order = require('../order/order.model');
const logger = require('../../core/logger');

class RecommendationService {
  constructor() {
    this.similarityThreshold = 0.1;
    this.maxRecommendations = 12;
  }

  // Collaborative filtering based on user orders
  async getCollaborativeRecommendations(userId, limit = this.maxRecommendations) {
    try {
      // Get user's order history
      const userOrders = await Order.find({ user: userId, status: 'delivered' })
        .populate('items.product', 'category tags cropType')
        .lean();

      if (userOrders.length === 0) {
        return await this.getPopularProducts(limit);
      }

      // Extract product categories and tags from user's orders
      const userPreferences = this.extractUserPreferences(userOrders);

      // Find similar users based on order patterns
      const similarUsers = await this.findSimilarUsers(userId, userPreferences);

      // Get products bought by similar users but not by current user
      const recommendedProducts = await this.getProductsFromSimilarUsers(
        userId,
        similarUsers,
        userPreferences,
        limit
      );

      return recommendedProducts;
    } catch (error) {
      logger.error('Error getting collaborative recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // Content-based recommendations
  async getContentBasedRecommendations(productId, limit = this.maxRecommendations) {
    try {
      const product = await Product.findById(productId).lean();
      if (!product) return [];

      const recommendations = await Product.find({
        _id: { $ne: productId },
        isActive: true,
        $or: [
          { category: product.category },
          { tags: { $in: product.tags } },
          { cropType: { $in: product.cropType } },
          { brand: product.brand }
        ]
      })
        .populate('vendor', 'name location')
        .sort({ 'rating.average': -1, purchaseCount: -1 })
        .limit(limit);

      return recommendations;
    } catch (error) {
      logger.error('Error getting content-based recommendations:', error);
      return [];
    }
  }

  // Hybrid recommendations combining collaborative and content-based
  async getHybridRecommendations(userId, productId = null, limit = this.maxRecommendations) {
    try {
      let recommendations = [];

      if (productId) {
        // If viewing a product, prioritize content-based recommendations
        const contentBased = await this.getContentBasedRecommendations(productId, limit / 2);
        const collaborative = await this.getCollaborativeRecommendations(userId, limit / 2);
        recommendations = [...contentBased, ...collaborative];
      } else {
        // General recommendations for user
        recommendations = await this.getCollaborativeRecommendations(userId, limit);
      }

      // Remove duplicates and limit results
      const uniqueRecommendations = this.removeDuplicates(recommendations);
      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      logger.error('Error getting hybrid recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // AI-powered recommendations using simple TF (bag-of-words) cosine similarity
  // This is a lightweight, local "AI-like" approach that doesn't require external APIs.
  async getAIRecommendations(productId, limit = this.maxRecommendations) {
    try {
      const products = await Product.find({ isActive: true }).lean();
      const target = products.find(p => p._id.toString() === productId.toString());
      if (!target) return [];

      // Build simple token counts for each product (name + description + tags)
      const tokenize = txt => (txt || '')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      const buildVector = (prod) => {
        const text = [prod.name, prod.description, (prod.tags || []).join(' ')].join(' ');
        const tokens = tokenize(text);
        const counts = {};
        tokens.forEach(t => counts[t] = (counts[t] || 0) + 1);
        return counts;
      };

      const dot = (a, b) => Object.keys(a).reduce((sum, k) => sum + (a[k] * (b[k] || 0)), 0);
      const norm = (v) => Math.sqrt(Object.values(v).reduce((s, val) => s + val * val, 0));

      const vectors = products.map(p => ({ id: p._id.toString(), vector: buildVector(p), product: p }));
      const targetVector = vectors.find(v => v.id === productId.toString()).vector;

      const scores = vectors
        .filter(v => v.id !== productId.toString())
        .map(v => {
          const d = dot(targetVector, v.vector);
          const score = d / (norm(targetVector) * norm(v.vector) + 1e-9);
          return { product: v.product, score: isNaN(score) ? 0 : score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.product);

      return scores;
    } catch (error) {
      logger.error('Error getting AI recommendations:', error);
      return [];
    }
  }

  // Trending products based on recent purchases
  async getTrendingRecommendations(limit = this.maxRecommendations) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendingProducts = await Product.find({
        isActive: true,
        updatedAt: { $gte: thirtyDaysAgo }
      })
        .populate('vendor', 'name location')
        .sort({ purchaseCount: -1, viewCount: -1, 'rating.average': -1 })
        .limit(limit);

      return trendingProducts;
    } catch (error) {
      logger.error('Error getting trending recommendations:', error);
      return [];
    }
  }

  // Seasonal recommendations
  async getSeasonalRecommendations(limit = this.maxRecommendations) {
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

      const seasonalProducts = await Product.find({
        isActive: true,
        seasonal: true,
        $or: [
          { seasonStart: currentMonth },
          { seasonEnd: currentMonth }
        ]
      })
        .populate('vendor', 'name location')
        .sort({ purchaseCount: -1, 'rating.average': -1 })
        .limit(limit);

      return seasonalProducts;
    } catch (error) {
      logger.error('Error getting seasonal recommendations:', error);
      return [];
    }
  }

  // Cross-sell recommendations based on cart items
  async getCrossSellRecommendations(cartItems, limit = this.maxRecommendations) {
    try {
      if (!cartItems || cartItems.length === 0) return [];

      const productIds = cartItems.map(item => item.product);
      const products = await Product.find({ _id: { $in: productIds } }).lean();

      // Extract common categories and tags
      const categories = [...new Set(products.map(p => p.category))];
      const tags = [...new Set(products.flatMap(p => p.tags))];
      const cropTypes = [...new Set(products.flatMap(p => p.cropType))];

      const recommendations = await Product.find({
        _id: { $nin: productIds },
        isActive: true,
        $or: [
          { category: { $in: categories } },
          { tags: { $in: tags } },
          { cropType: { $in: cropTypes } }
        ]
      })
        .populate('vendor', 'name location')
        .sort({ 'rating.average': -1, purchaseCount: -1 })
        .limit(limit);

      return recommendations;
    } catch (error) {
      logger.error('Error getting cross-sell recommendations:', error);
      return [];
    }
  }

  // Helper methods
  extractUserPreferences(userOrders) {
    const preferences = {
      categories: new Map(),
      tags: new Map(),
      cropTypes: new Map(),
      brands: new Map()
    };

    userOrders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        if (product) {
          // Count category preferences
          preferences.categories.set(
            product.category,
            (preferences.categories.get(product.category) || 0) + item.quantity
          );

          // Count tag preferences
          product.tags.forEach(tag => {
            preferences.tags.set(tag, (preferences.tags.get(tag) || 0) + item.quantity);
          });

          // Count crop type preferences
          product.cropType.forEach(crop => {
            preferences.cropTypes.set(crop, (preferences.cropTypes.get(crop) || 0) + item.quantity);
          });
        }
      });
    });

    return preferences;
  }

  async findSimilarUsers(userId, userPreferences) {
    try {
      // Get orders from other users with similar preferences
      const similarOrders = await Order.find({
        user: { $ne: userId },
        status: 'delivered',
        'items.product': { $exists: true }
      })
        .populate('items.product', 'category tags cropType')
        .limit(1000); // Limit for performance

      const userSimilarities = new Map();

      similarOrders.forEach(order => {
        const otherUserId = order.user.toString();
        const otherPreferences = this.extractUserPreferences([order]);

        const similarity = this.calculateSimilarity(userPreferences, otherPreferences);
        if (similarity > this.similarityThreshold) {
          userSimilarities.set(otherUserId, similarity);
        }
      });

      // Return top similar users
      return Array.from(userSimilarities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId]) => userId);
    } catch (error) {
      logger.error('Error finding similar users:', error);
      return [];
    }
  }

  calculateSimilarity(pref1, pref2) {
    let similarity = 0;
    let totalWeight = 0;

    // Category similarity
    const categorySimilarity = this.jaccardSimilarity(
      Array.from(pref1.categories.keys()),
      Array.from(pref2.categories.keys())
    );
    similarity += categorySimilarity * 0.4;
    totalWeight += 0.4;

    // Tag similarity
    const tagSimilarity = this.jaccardSimilarity(
      Array.from(pref1.tags.keys()),
      Array.from(pref2.tags.keys())
    );
    similarity += tagSimilarity * 0.3;
    totalWeight += 0.3;

    // Crop type similarity
    const cropSimilarity = this.jaccardSimilarity(
      Array.from(pref1.cropTypes.keys()),
      Array.from(pref2.cropTypes.keys())
    );
    similarity += cropSimilarity * 0.3;
    totalWeight += 0.3;

    return totalWeight > 0 ? similarity / totalWeight : 0;
  }

  jaccardSimilarity(set1, set2) {
    const intersection = new Set(set1.filter(x => set2.includes(x)));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  async getProductsFromSimilarUsers(userId, similarUserIds, userPreferences, limit) {
    try {
      if (similarUserIds.length === 0) return [];

      const similarOrders = await Order.find({
        user: { $in: similarUserIds },
        status: 'delivered'
      }).populate('items.product');

      const productScores = new Map();

      similarOrders.forEach(order => {
        order.items.forEach(item => {
          const product = item.product;
          if (product && product.isActive) {
            const score = productScores.get(product._id.toString()) || 0;
            productScores.set(product._id.toString(), score + item.quantity);
          }
        });
      });

      // Get user's already purchased products
      const userPurchasedProducts = new Set();
      const userOrders = await Order.find({ user: userId, status: 'delivered' });
      userOrders.forEach(order => {
        order.items.forEach(item => {
          userPurchasedProducts.add(item.product.toString());
        });
      });

      // Filter out already purchased products and sort by score
      const recommendedProductIds = Array.from(productScores.entries())
        .filter(([productId]) => !userPurchasedProducts.has(productId))
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId]) => productId);

      const recommendations = await Product.find({
        _id: { $in: recommendedProductIds }
      })
        .populate('vendor', 'name location')
        .sort({ 'rating.average': -1 });

      return recommendations;
    } catch (error) {
      logger.error('Error getting products from similar users:', error);
      return [];
    }
  }

  async getPopularProducts(limit) {
    try {
      const products = await Product.find({ isActive: true })
        .populate('vendor', 'name location')
        .sort({ purchaseCount: -1, 'rating.average': -1, viewCount: -1 })
        .limit(limit);

      return products;
    } catch (error) {
      logger.error('Error getting popular products:', error);
      return [];
    }
  }

  removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      const id = product._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
}

module.exports = new RecommendationService();