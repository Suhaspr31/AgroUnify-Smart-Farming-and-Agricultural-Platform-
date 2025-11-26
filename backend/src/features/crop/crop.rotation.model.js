const mongoose = require('mongoose');

const cropRotationSchema = new mongoose.Schema({
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  sequence: [{
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop'
    },
    order: Number,
    duration: Number, // in months
    benefits: [String]
  }],
  startDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CropRotation', cropRotationSchema);
