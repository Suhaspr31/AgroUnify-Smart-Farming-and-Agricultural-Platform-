const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Neem Oil"
  type: { type: String, required: true }, // e.g., "Organic Fungicide"
  active_ingredient: { type: String, required: true }, // e.g., "Azadirachtin"
  application_rate: { type: String }, // e.g., "2-5 ml per liter"
  safety_precautions: [String],
  cost_estimate: { type: String } // e.g., "₹150-200 per hectare"
});

const diseaseLibrarySchema = new mongoose.Schema({
  // This MUST match the exact class name from your YOLOv8 model
  disease_key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  disease_name: { type: String, required: true }, // e.g., "Tomato Leaf Mold"
  scientific_name: { type: String }, // e.g., "Passalora fulva"
  description: { type: String, required: true },
  symptoms: [String],
  causes: [String],
  pathogen_type: {
    type: String,
    enum: ['Fungal', 'Bacterial', 'Viral', 'Parasitic', 'Nutritional']
  },
  crop_type: { type: String, required: true }, // e.g., "Tomato"
  severity_levels: {
    low: { description: String, treatment: [String] },
    medium: { description: String, treatment: [String] },
    high: { description: String, treatment: [String] }
  },
  treatment_advice: {
    organic: [String], // e.g., "1. Remove and destroy infected leaves."
    chemical: [String], // e.g., "1. Apply a copper-based fungicide."
    biological: [String] // e.g., "1. Apply Trichoderma-based bio-fungicide."
  },
  product_recommendations: [productSchema],
  prevention_tips: [String],
  environmental_factors: {
    optimal_temp: String, // e.g., "20-25°C"
    humidity: String, // e.g., "60-80%"
    soil_ph: String, // e.g., "6.0-7.0"
    rainfall: String // e.g., "Moderate rainfall preferred"
  },
  monitoring_schedule: {
    frequency: String, // e.g., "Weekly"
    indicators: [String],
    action_threshold: String
  },
  economic_impact: {
    yield_loss_percentage: String, // e.g., "10-30%"
    cost_of_treatment: String, // e.g., "₹500-2000 per hectare"
    prevention_cost: String // e.g., "₹200-500 per hectare"
  },
  source_links: [String], // For further reading
  last_updated: {
    type: Date,
    default: Date.now
  },
  verified_by: String, // Expert or source who verified this information
  region_specific: [String] // Regions where this disease is common
}, {
  timestamps: true
});

// Add indexes for better performance
diseaseLibrarySchema.index({ disease_key: 1 }, { unique: true });
diseaseLibrarySchema.index({ crop_type: 1 });
diseaseLibrarySchema.index({ pathogen_type: 1 });
diseaseLibrarySchema.index({ 'symptoms': 1 });

// Virtual for URL
diseaseLibrarySchema.virtual('url').get(function() {
  return `/api/diseases/${this.disease_key}`;
});

module.exports = mongoose.model('DiseaseLibrary', diseaseLibrarySchema);