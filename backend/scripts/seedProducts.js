const mongoose = require('mongoose');
const Product = require('../src/features/product/product.model');
const productsData = require('../../database/seeders/comprehensive-products.json');
const logger = require('../src/core/logger');
const fs = require('fs');
const path = require('path');

// Helper function to normalize names for matching
const normalizeName = (name) => {
  return name
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and content
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim()
    .toLowerCase();
};

// Helper function to get image for product
const getImageForProduct = (productName) => {
  const productImagesDir = path.join(process.cwd(), '../frontend/public');
  const allImages = fs.readdirSync(productImagesDir);

  const normalizedProductName = normalizeName(productName);

  // First, try exact match after normalization
  let match = allImages.find(img => {
    const normalizedImageName = normalizeName(img.replace(/\.[^/.]+$/, ''));
    return normalizedImageName === normalizedProductName;
  });

  // If no exact match, try partial match (contains/includes)
  if (!match) {
    match = allImages.find(img => {
      const normalizedImageName = normalizeName(img.replace(/\.[^/.]+$/, ''));
      return normalizedImageName.includes(normalizedProductName) || normalizedProductName.includes(normalizedImageName);
    });
  }

  // If still no match, try word-based matching (at least 2 common words)
  if (!match) {
    const productWords = normalizedProductName.split(' ');
    match = allImages.find(img => {
      const normalizedImageName = normalizeName(img.replace(/\.[^/.]+$/, ''));
      const imageWords = normalizedImageName.split(' ');
      const commonWords = productWords.filter(word => imageWords.includes(word));
      return commonWords.length >= 2;
    });
  }

  // Return the match or fallback to a default image
  // Use encodeURIComponent to handle special characters in filenames
  return match ? `/${encodeURIComponent(match)}` : 'default.jpg';
};

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrounify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    logger.info('Cleared existing products');

    // Get vendor ID (assuming first user is vendor)
    const User = require('../src/features/user/user.model');
    const vendor = await User.findOne({ role: 'vendor' }).select('_id');

    if (!vendor) {
      logger.error('No vendor found. Please ensure users are seeded first.');
      process.exit(1);
    }

    // Prepare products data with vendor reference and automatic image assignment
    const productsWithVendor = productsData.map(product => {
      const imagePath = getImageForProduct(product.name);
      console.log(`Product: ${product.name} -> Image: ${imagePath}`);
      return {
        ...product,
        vendor: vendor._id,
        image: imagePath,
      };
    });

    // Insert products
    const products = await Product.insertMany(productsWithVendor);
    logger.info(`Successfully seeded ${products.length} products`);

    // Update Elasticsearch index
    const elasticsearchService = require('../src/features/product/elasticsearch.service');
    await elasticsearchService.initializeIndex();

    for (const product of products) {
      await elasticsearchService.indexProduct(product);
    }

    logger.info('Elasticsearch index updated');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;