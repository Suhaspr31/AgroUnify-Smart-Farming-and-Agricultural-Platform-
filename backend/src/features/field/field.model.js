const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [0, 'Area must be positive']
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial', 'laterite']
  },
  soilPH: {
    type: Number,
    min: 0,
    max: 14
  },
  currentCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  cropHistory: [{
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    plantedDate: Date,
    harvestedDate: Date,
    yield: Number
  }],
  irrigationType: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'furrow', 'rainfed']
  },
  sensors: [{
    type: {
      type: String,
      enum: ['soil_moisture', 'temperature', 'humidity', 'ph']
    },
    value: Number,
    unit: String,
    timestamp: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
fieldSchema.index({ farm: 1 });
fieldSchema.index({ currentCrop: 1 });

module.exports = mongoose.model('Field', fieldSchema);
