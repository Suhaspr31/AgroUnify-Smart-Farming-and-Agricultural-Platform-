const fs = require('fs');
const csv = require('csv-parser');
const Product = require('./product.model');
const User = require('../user/user.model');
const logger = require('../../core/logger');

class ProductImportService {
  constructor() {
    this.defaultVendorId = null;
  }

  // Import products from CSV file
  async importProductsFromCSV(csvFilePath) {
    try {
      logger.info('Starting product import from CSV...');

      // Get default vendor (create if doesn't exist)
      await this.ensureDefaultVendor();

      const products = [];
      const errors = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (row) => {
            try {
              const product = this.transformCSVRow(row);
              if (product) {
                products.push(product);
              }
            } catch (error) {
              errors.push({ row, error: error.message });
              logger.warn('Error processing row:', error.message);
            }
          })
          .on('end', async () => {
            try {
              if (products.length > 0) {
                // Clear existing products first
                await Product.deleteMany({});

                // Insert new products (let MongoDB auto-generate _id)
                const productsToInsert = products.map(product => {
                  const { _id, ...productWithoutId } = product; // Remove _id to let MongoDB generate it
                  return productWithoutId;
                });

                const insertedProducts = await Product.insertMany(productsToInsert);
                logger.info(`Successfully imported ${insertedProducts.length} products`);

                resolve({
                  success: true,
                  imported: insertedProducts.length,
                  errors: errors.length,
                  errorDetails: errors.slice(0, 10) // Return first 10 errors
                });
              } else {
                resolve({
                  success: false,
                  imported: 0,
                  errors: errors.length,
                  errorDetails: errors
                });
              }
            } catch (error) {
              logger.error('Error inserting products:', error);
              reject(error);
            }
          })
          .on('error', (error) => {
            logger.error('Error reading CSV file:', error);
            reject(error);
          });
      });
    } catch (error) {
      logger.error('Error importing products:', error);
      throw error;
    }
  }

  // Transform CSV row to product object
  transformCSVRow(row) {
    try {
      // Validate required fields
      if (!row.id || !row.name || !row.category) {
        throw new Error('Missing required fields: id, name, category');
      }

      // Parse numeric fields
      const basePrice = parseFloat(row.basePrice);
      const stock = parseInt(row.stock);
      const discount = parseFloat(row.discount || 0);
      const supplierRating = parseFloat(row.supplierRating || 0);

      if (isNaN(basePrice) || basePrice <= 0) {
        throw new Error('Invalid basePrice');
      }

      if (isNaN(stock) || stock < 0) {
        throw new Error('Invalid stock');
      }

      // Calculate current price (basePrice with discount)
      const currentPrice = basePrice * (1 - discount / 100);

      // Parse boolean fields
      const isFeatured = this.parseBoolean(row.isFeatured);
      const isTrending = this.parseBoolean(row.isTrending);

      // Create product object
      const product = {
        id: row.id,
        name: row.name,
        category: row.category,
        subcategory: row.subcategory || '',
        brand: row.brand || '',
        description: row.description || 'No description available.', // Add default description
        basePrice,
        currentPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
        discount,
        unit: row.unit || 'kg',
        stock,
        vendor: this.defaultVendorId,
        isActive: true,
        isFeatured,
        isTrending,
        supplierRating,
        deliveryTime: 3, // Default delivery time
        lastPriceUpdate: new Date(),
        // Optional fields
        ...(row.tags && { tags: row.tags.split(',').map(tag => tag.trim()) }),
        ...(row.cropType && { cropType: row.cropType.split(',').map(type => type.trim()) }),
        ...(row.region && { region: row.region.split(',').map(reg => reg.trim()) }),
        ...(row.seasonal && { seasonal: this.parseBoolean(row.seasonal) }),
        ...(row.seasonStart && { seasonStart: row.seasonStart }),
        ...(row.seasonEnd && { seasonEnd: row.seasonEnd }),
        ...(row.minOrderQuantity && { minOrderQuantity: parseInt(row.minOrderQuantity) }),
        ...(row.maxOrderQuantity && { maxOrderQuantity: parseInt(row.maxOrderQuantity) }),
        ...(row.viewCount && { viewCount: parseInt(row.viewCount) }),
        ...(row.purchaseCount && { purchaseCount: parseInt(row.purchaseCount) }),
        ...(row.certifications && { certifications: row.certifications.split(',').map(cert => cert.trim()) }),
        ...(row.warranty && { warranty: row.warranty })
      };

      // Add specifications if available
      if (row.specifications) {
        try {
          product.specifications = JSON.parse(row.specifications);
        } catch (error) {
          // If not JSON, treat as simple string
          product.specifications = { details: row.specifications };
        }
      }

      return product;
    } catch (error) {
      throw new Error(`Error transforming row ${row.id || 'unknown'}: ${error.message}`);
    }
  }

  // Parse boolean values from CSV
  parseBoolean(value) {
    if (!value) return false;
    const lowerValue = value.toString().toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }

  // Ensure default vendor exists
  async ensureDefaultVendor() {
    try {
      let vendor = await User.findOne({ email: 'vendor@agrounify.com' });

      if (!vendor) {
        vendor = new User({
          name: 'AgroUnify Vendor',
          email: 'vendor@agrounify.com',
          password: 'hashedpassword', // In real implementation, hash the password
          role: 'vendor',
          isVerified: true
        });
        await vendor.save();
        logger.info('Created default vendor account');
      }

      this.defaultVendorId = vendor._id;
    } catch (error) {
      logger.error('Error ensuring default vendor:', error);
      throw error;
    }
  }

  // Validate CSV file format
  async validateCSV(csvFilePath) {
    try {
      const requiredHeaders = ['id', 'name', 'category', 'basePrice', 'unit', 'stock'];
      const headers = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('headers', (headerList) => {
            headers.push(...headerList);
          })
          .on('data', () => {}) // Just consume data
          .on('end', () => {
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

            if (missingHeaders.length > 0) {
              resolve({
                valid: false,
                errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
              });
            } else {
              resolve({
                valid: true,
                headers
              });
            }
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      logger.error('Error validating CSV:', error);
      throw error;
    }
  }

  // Get import statistics
  async getImportStatistics() {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$currentPrice' },
            minPrice: { $min: '$currentPrice' },
            maxPrice: { $max: '$currentPrice' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalProducts = await Product.countDocuments();
      const totalStock = await Product.aggregate([
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ]);

      return {
        totalProducts,
        totalStockValue: totalStock[0]?.total || 0,
        categoryStats: stats,
        lastImport: new Date()
      };
    } catch (error) {
      logger.error('Error getting import statistics:', error);
      throw error;
    }
  }
}

module.exports = new ProductImportService();