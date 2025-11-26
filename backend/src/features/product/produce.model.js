const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton']
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'basic'],
    default: 'standard'
  },
  harvestDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  certification: {
    organic: { type: Boolean, default: false },
    gmp: { type: Boolean, default: false }
  },
  location: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

produceSchema.index({ farmer: 1 });
produceSchema.index({ status: 1 });
produceSchema.index({ harvestDate: -1 });

module.exports = mongoose.model('Produce', produceSchema);
