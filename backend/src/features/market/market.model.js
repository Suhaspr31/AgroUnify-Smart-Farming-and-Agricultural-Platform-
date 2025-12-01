const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  commodity: {
    type: String,
    required: true,
    index: true
  },
  market: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  district: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  minPrice: {
    type: Number
  },
  maxPrice: {
    type: Number
  },
  modalPrice: {
    type: Number
  },
  unit: {
    type: String,
    default: 'quintal'
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  arrivalDate: {
    type: Date
  },
  variety: {
    type: String
  },
  grade: {
    type: String
  },
  source: {
    type: String,
    default: 'agmarknet'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient queries
marketPriceSchema.index({ commodity: 1, state: 1, date: -1 });
marketPriceSchema.index({ commodity: 1, date: -1 });
marketPriceSchema.index({ state: 1, date: -1 });

// Virtual for price change calculation
marketPriceSchema.virtual('priceChange').get(function() {
  if (this.minPrice && this.maxPrice) {
    return ((this.maxPrice - this.minPrice) / this.minPrice) * 100;
  }
  return 0;
});

// Method to get price trends
marketPriceSchema.statics.getPriceTrends = async function(commodity, state, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    commodity: new RegExp(commodity, 'i'),
    state: state,
    date: { $gte: startDate }
  })
  .sort({ date: 1 })
  .select('date price minPrice maxPrice modalPrice unit')
  .limit(100);
};

// Method to get latest prices by commodity
marketPriceSchema.statics.getLatestPrices = async function(commodities = []) {
  const pipeline = [
    {
      $sort: { commodity: 1, date: -1, createdAt: -1 }
    },
    {
      $group: {
        _id: '$commodity',
        latest: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latest' }
    }
  ];

  if (commodities.length > 0) {
    pipeline.unshift({
      $match: { commodity: { $in: commodities } }
    });
  }

  return this.aggregate(pipeline);
};

module.exports = mongoose.model('MarketPrice', marketPriceSchema);