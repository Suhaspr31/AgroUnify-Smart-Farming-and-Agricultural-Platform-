const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  totalArea: {
    type: Number,
    required: [true, 'Total area is required'],
    min: [0, 'Area must be positive']
  },
  areaUnit: {
    type: String,
    enum: ['acre', 'hectare', 'bigha'],
    default: 'acre'
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial', 'laterite'],
    required: true
  },
  irrigationType: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'furrow', 'rainfed'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
farmSchema.index({ owner: 1 });
farmSchema.index({ 'location.city': 1 });
farmSchema.index({ createdAt: -1 });

// Virtual for fields
farmSchema.virtual('fields', {
  ref: 'Field',
  localField: '_id',
  foreignField: 'farm'
});

farmSchema.set('toJSON', { virtuals: true });
farmSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Farm', farmSchema);
