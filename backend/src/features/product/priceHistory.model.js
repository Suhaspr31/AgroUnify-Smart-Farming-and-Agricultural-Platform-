const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceChange: {
    type: Number,
    required: true
  },
  percentageChange: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  source: {
    type: String,
    enum: ['market_api', 'manual_update', 'seasonal_adjustment', 'demand_based', 'competition_based'],
    required: true
  },
  marketData: {
    type: mongoose.Schema.Types.Mixed // Store API response data
  }
}, {
  timestamps: true
});

// Indexes
priceHistorySchema.index({ productId: 1, date: -1 });
priceHistorySchema.index({ date: -1 });
priceHistorySchema.index({ source: 1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);