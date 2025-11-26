const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true
  },
  variety: {
    type: String,
    trim: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plantingDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: {
    type: Date
  },
  actualHarvestDate: {
    type: Date
  },
  stage: {
    type: String,
    enum: ['seeding', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest'],
    default: 'seeding'
  },
  health: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  expectedYield: {
    type: Number,
    min: 0
  },
  actualYield: {
    type: Number,
    min: 0
  },
  yieldUnit: {
    type: String,
    default: 'kg'
  },
  activities: [{
    type: {
      type: String,
      enum: ['irrigation', 'fertilization', 'pesticide', 'weeding', 'monitoring']
    },
    description: String,
    date: Date,
    cost: Number
  }],
  notes: {
    type: String
  },
  isHarvested: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
cropSchema.index({ field: 1 });
cropSchema.index({ farmer: 1 });
cropSchema.index({ plantingDate: -1 });

module.exports = mongoose.model('Crop', cropSchema);
