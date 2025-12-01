const { Client } = require('@elastic/elasticsearch');
const Product = require('./product.model');
const logger = require('../../core/logger');

class ElasticsearchService {
  constructor() {
    const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
    const username = process.env.ELASTICSEARCH_USERNAME;
    const password = process.env.ELASTICSEARCH_PASSWORD;

    const clientOptions = { node };
    // Only set auth when username/password are provided. Useful when running
    // a local Elasticsearch instance with xpack security disabled.
    if (username && password) {
      clientOptions.auth = { username, password };
    }

    this.client = new Client(clientOptions);
    this.indexName = 'products';
  }

  // Lightweight health check for Elasticsearch connection
  async ping() {
    try {
      const ok = await this.client.ping();
      return !!ok;
    } catch (err) {
      return false;
    }
  }

  async initializeIndex() {
    try {
      const indexExists = await this.client.indices.exists({ index: this.indexName });

      if (!indexExists) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                name: { type: 'text', analyzer: 'standard', fields: { suggest: { type: 'completion' } } },
                description: { type: 'text', analyzer: 'standard' },
                category: { type: 'keyword' },
                subcategory: { type: 'keyword' },
                brand: { type: 'keyword' },
                tags: { type: 'keyword' },
                cropType: { type: 'keyword' },
                region: { type: 'keyword' },
                price: { type: 'float' },
                rating: { type: 'float' },
                vendor: { type: 'keyword' },
                isActive: { type: 'boolean' },
                isFeatured: { type: 'boolean' },
                isTrending: { type: 'boolean' },
                seasonal: { type: 'boolean' },
                viewCount: { type: 'integer' },
                purchaseCount: { type: 'integer' },
                supplierRating: { type: 'float' },
                createdAt: { type: 'date' }
              }
            },
            settings: {
              analysis: {
                analyzer: {
                  custom_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'porter_stem']
                  }
                }
              }
            }
          }
        });
        logger.info('Elasticsearch products index created');
      }
    } catch (error) {
      logger.error('Error initializing Elasticsearch index:', error);
    }
  }

  async indexProduct(product) {
    try {
      await this.client.index({
        index: this.indexName,
        id: product._id.toString(),
        body: {
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          tags: product.tags,
          cropType: product.cropType,
          region: product.region,
          price: product.price,
          rating: product.rating.average,
          vendor: product.vendor.toString(),
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
          seasonal: product.seasonal,
          viewCount: product.viewCount,
          purchaseCount: product.purchaseCount,
          supplierRating: product.supplierRating,
          createdAt: product.createdAt
        }
      });
    } catch (error) {
      logger.error('Error indexing product:', error);
    }
  }

  async updateProduct(productId, updateData) {
    try {
      await this.client.update({
        index: this.indexName,
        id: productId,
        body: {
          doc: updateData
        }
      });
    } catch (error) {
      logger.error('Error updating product in Elasticsearch:', error);
    }
  }

  async deleteProduct(productId) {
    try {
      await this.client.delete({
        index: this.indexName,
        id: productId
      });
    } catch (error) {
      logger.error('Error deleting product from Elasticsearch:', error);
    }
  }

  async searchProducts(query, filters = {}, page = 1, limit = 12) {
    try {
      const from = (page - 1) * limit;
      const must = [];
      const filter = [];

      // Text search
      if (query) {
        must.push({
          multi_match: {
            query: query,
            fields: ['name^3', 'description^2', 'tags^2', 'brand', 'category'],
            fuzziness: 'AUTO'
          }
        });
      }

      // Filters
      if (filters.category) {
        filter.push({ term: { category: filters.category } });
      }

      if (filters.subcategory) {
        filter.push({ term: { subcategory: filters.subcategory } });
      }

      if (filters.brand) {
        filter.push({ term: { brand: filters.brand } });
      }

      if (filters.cropType && filters.cropType.length > 0) {
        filter.push({ terms: { cropType: filters.cropType } });
      }

      if (filters.region && filters.region.length > 0) {
        filter.push({ terms: { region: filters.region } });
      }

      if (filters.minPrice || filters.maxPrice) {
        const priceRange = {};
        if (filters.minPrice) priceRange.gte = filters.minPrice;
        if (filters.maxPrice) priceRange.lte = filters.maxPrice;
        filter.push({ range: { price: priceRange } });
      }

      if (filters.seasonal !== undefined) {
        filter.push({ term: { seasonal: filters.seasonal } });
      }

      if (filters.isFeatured !== undefined) {
        filter.push({ term: { isFeatured: filters.isFeatured } });
      }

      if (filters.isTrending !== undefined) {
        filter.push({ term: { isTrending: filters.isTrending } });
      }

      filter.push({ term: { isActive: true } });

      // Sorting
      // Sorting
      let sort = [{ _score: 'desc' }]; // default for Elasticsearch
      let mongoSort = { createdAt: -1 }; // default for MongoDB fallback

      switch (filters.sort) {
        case 'price_asc':
          sort = [{ price: 'asc' }];
          mongoSort = { price: 1 };
          break;
        case 'price_desc':
          sort = [{ price: 'desc' }];
          mongoSort = { price: -1 };
          break;
        case 'rating':
          sort = [{ rating: 'desc' }];
          mongoSort = { rating: -1 };
          break;
        case 'popular':
          sort = [{ purchaseCount: 'desc' }];
          mongoSort = { purchaseCount: -1 };
          break;
        case 'newest':
          sort = [{ createdAt: 'desc' }];
          mongoSort = { createdAt: -1 };
          break;
        default:
          // Keep defaults
          break;
      }


      const searchBody = {
        query: {
          bool: {
            must,
            filter
          }
        },
        sort,
        from,
        size: limit
      };

      const result = await this.client.search({
        index: this.indexName,
        body: searchBody
      });

      const productIds = result.hits.hits.map(hit => hit._id);
      const products = await Product.find({ _id: { $in: productIds } })
        .populate('vendor', 'name location');

      return {
        products,
        total: result.hits.total.value,
        aggregations: result.aggregations
      };
    } catch (error) {
      logger.error('Error searching products:', error);
      throw error;
    }
  }

  async getSuggestions(query, field = 'name') {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          suggest: {
            product_suggest: {
              text: query,
              completion: {
                field: `${field}.suggest`,
                fuzzy: {
                  fuzziness: 2
                }
              }
            }
          }
        }
      });

      return result.suggest.product_suggest[0].options.map(option => option.text);
    } catch (error) {
      logger.error('Error getting suggestions:', error);
      return [];
    }
  }

  async syncAllProducts() {
    try {
      const products = await Product.find({ isActive: true });
      const body = products.flatMap(product => [
        { index: { _index: this.indexName, _id: product._id.toString() } },
        {
          name: product.name,
          description: product.description,
          'name.suggest': { input: [product.name].concat(product.tags || []) },
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          tags: product.tags,
          cropType: product.cropType,
          region: product.region,
          price: product.price,
          rating: product.rating.average,
          vendor: product.vendor.toString(),
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
          seasonal: product.seasonal,
          viewCount: product.viewCount,
          purchaseCount: product.purchaseCount,
          supplierRating: product.supplierRating,
          createdAt: product.createdAt
        }
      ]);

      if (body.length > 0) {
        await this.client.bulk({ body });
        logger.info(`Synced ${products.length} products to Elasticsearch`);
      }
    } catch (error) {
      logger.error('Error syncing products to Elasticsearch:', error);
    }
  }
}

module.exports = new ElasticsearchService();