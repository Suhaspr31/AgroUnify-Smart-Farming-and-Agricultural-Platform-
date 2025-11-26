const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  variant: {
    type: String // e.g., "1kg", "5kg", "Red", "Blue"
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

skuSchema.index({ product: 1 });
skuSchema.index({ sku: 1 });

module.exports = mongoose.model('SKU', skuSchema);
