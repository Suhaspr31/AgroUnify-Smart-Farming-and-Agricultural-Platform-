const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sowing_alert', 'weather_warning', 'storm_alert', 'temperature_alert'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'critical'],
    default: 'moderate'
  },
  location: {
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  weatherData: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    precipitation: Number,
    description: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Ensure virtuals are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);