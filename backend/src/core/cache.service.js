const redis = require('redis');
const logger = require('./logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      // Skip Redis initialization if not configured (graceful degradation)
      if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
        logger.info('Redis not configured, running without caching (optional feature)');
        this.isConnected = false;
        return;
      }

      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD || undefined,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        }
      });

      this.client.on('error', (err) => {
        // Only log as warning, don't set connected to false to avoid spam
        if (err.code === 'ECONNREFUSED') {
          if (!this.connectionErrorLogged) {
            logger.warn('Redis server not available, running without caching. Install and start Redis for better performance.');
            this.connectionErrorLogged = true;
          }
        } else {
          logger.error('Redis Client Error:', err);
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
        this.connectionErrorLogged = false; // Reset error flag on successful connection
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
        this.connectionErrorLogged = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      // Try to connect with timeout
      try {
        await this.client.connect();
      } catch (connectError) {
        logger.warn('Redis connection failed, running without caching:', connectError.message);
        this.isConnected = false;
      }
    } catch (error) {
      logger.warn('Redis initialization failed, running without caching:', error.message);
      this.isConnected = false;
    }
  }

  // Generic cache methods
  async get(key) {
    try {
      if (!this.isConnected) return null;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) return false;
      const serializedValue = JSON.stringify(value);

      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) return false;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) return false;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  // Product-specific caching
  async getProduct(productId) {
    const key = `product:${productId}`;
    return await this.get(key);
  }

  async setProduct(productId, product, ttl = 3600) { // 1 hour default
    const key = `product:${productId}`;
    return await this.set(key, product, ttl);
  }

  async invalidateProduct(productId) {
    const key = `product:${productId}`;
    return await this.del(key);
  }

  // Search results caching
  async getSearchResults(query, filters) {
    const key = `search:${JSON.stringify({ query, filters })}`;
    return await this.get(key);
  }

  async setSearchResults(query, filters, results, ttl = 1800) { // 30 minutes
    const key = `search:${JSON.stringify({ query, filters })}`;
    return await this.set(key, results, ttl);
  }

  // User session caching
  async getUserSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async setUserSession(sessionId, sessionData, ttl = 86400) { // 24 hours
    const key = `session:${sessionId}`;
    return await this.set(key, sessionData, ttl);
  }

  // Recommendations caching
  async getRecommendations(userId, type = 'general') {
    const key = `recommendations:${userId}:${type}`;
    return await this.get(key);
  }

  async setRecommendations(userId, recommendations, type = 'general', ttl = 7200) { // 2 hours
    const key = `recommendations:${userId}:${type}`;
    return await this.set(key, recommendations, ttl);
  }

  // Popular products caching
  async getPopularProducts(category = null) {
    const key = `popular:${category || 'all'}`;
    return await this.get(key);
  }

  async setPopularProducts(products, category = null, ttl = 3600) { // 1 hour
    const key = `popular:${category || 'all'}`;
    return await this.set(key, products, ttl);
  }

  // Dynamic pricing caching
  async getDynamicPrice(productId) {
    const key = `dynamic_price:${productId}`;
    return await this.get(key);
  }

  async setDynamicPrice(productId, price, ttl = 1800) { // 30 minutes
    const key = `dynamic_price:${productId}`;
    return await this.set(key, price, ttl);
  }

  // Inventory data caching
  async getInventoryData(productId) {
    const key = `inventory:${productId}`;
    return await this.get(key);
  }

  async setInventoryData(productId, data, ttl = 900) { // 15 minutes
    const key = `inventory:${productId}`;
    return await this.set(key, data, ttl);
  }

  // Supplier rankings caching
  async getSupplierRankings(category = null) {
    const key = `supplier_rankings:${category || 'all'}`;
    return await this.get(key);
  }

  async setSupplierRankings(rankings, category = null, ttl = 7200) { // 2 hours
    const key = `supplier_rankings:${category || 'all'}`;
    return await this.set(key, rankings, ttl);
  }

  // Batch operations
  async mget(keys) {
    try {
      if (!this.isConnected) return [];
      const values = await this.client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return [];
    }
  }

  async mset(keyValuePairs, ttl = null) {
    try {
      if (!this.isConnected) return false;

      const pipeline = this.client.multi();
      keyValuePairs.forEach(({ key, value }) => {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setEx(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  // Cache warming
  async warmProductCache(productIds) {
    try {
      // This would typically fetch products from database and cache them
      // Implementation depends on your product service
      logger.info(`Warming cache for ${productIds.length} products`);
      // Placeholder - actual implementation would fetch and cache products
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
  }

  // Cache statistics
  async getStats() {
    try {
      if (!this.isConnected) return { connected: false };

      const info = await this.client.info();
      const dbSize = await this.client.dbSize();

      return {
        connected: true,
        dbSize,
        info: this.parseRedisInfo(info)
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const parsed = {};

    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    });

    return parsed;
  }

  // Cache invalidation patterns
  async invalidateProductRelated(productId) {
    const keys = [
      `product:${productId}`,
      `dynamic_price:${productId}`,
      `inventory:${productId}`
    ];

    // Also invalidate search results that might contain this product
    // This is a simplified approach - in production, you might use tags
    keys.push(`search:*${productId}*`);

    for (const key of keys) {
      await this.del(key);
    }
  }

  async invalidateCategoryRelated(category) {
    // Invalidate popular products for this category
    await this.del(`popular:${category}`);

    // Invalidate supplier rankings for this category
    await this.del(`supplier_rankings:${category}`);
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) return { status: 'disconnected' };

      await this.client.ping();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Graceful shutdown
  async close() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

module.exports = new CacheService();