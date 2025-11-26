const mongoose = require('mongoose');

const cropAnalysisSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  analysisDate: {
    type: Date,
    default: Date.now
  },
  diseaseDetected: {
    type: Boolean,
    default: false
  },
  diseaseDetails: {
    name: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    recommendations: [String],
    image: String
  },
  nutritionDeficiency: [{
    nutrient: String,
    level: String,
    recommendation: String
  }],
  overallHealth: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CropAnalysis', cropAnalysisSchema);
