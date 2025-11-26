const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: {
    city: {
      type: String,
      required: true
    },
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  current: {
    temperature: Number,
    feelsLike: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: String,
    cloudCover: Number,
    visibility: Number,
    uvIndex: Number,
    description: String,
    icon: String
  },
  forecast: [{
    date: Date,
    tempMin: Number,
    tempMax: Number,
    humidity: Number,
    precipitation: Number,
    windSpeed: Number,
    description: String,
    icon: String
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['warning', 'watch', 'advisory']
    },
    event: String,
    description: String,
    startTime: Date,
    endTime: Date,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'extreme']
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
weatherSchema.index({ 'location.city': 1 });
weatherSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('Weather', weatherSchema);
