const mongoose = require('mongoose');

const weatherLogSchema = new mongoose.Schema({
  location: {
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  temperature: Number,
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  pressure: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
weatherLogSchema.index({ 'location.city': 1, timestamp: -1 });
weatherLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('WeatherLog', weatherLogSchema);
