module.exports = {
  USER_ROLES: {
    ADMIN: 'admin',
    FARMER: 'farmer',
    BUYER: 'buyer',
    VENDOR: 'vendor'
  },

  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  CROP_STAGES: {
    SEEDING: 'seeding',
    VEGETATIVE: 'vegetative',
    FLOWERING: 'flowering',
    FRUITING: 'fruiting',
    MATURITY: 'maturity',
    HARVEST: 'harvest'
  },

  SOIL_TYPES: {
    CLAY: 'clay',
    SANDY: 'sandy',
    LOAMY: 'loamy',
    BLACK: 'black',
    RED: 'red',
    ALLUVIAL: 'alluvial',
    LATERITE: 'laterite'
  },

  IRRIGATION_TYPES: {
    DRIP: 'drip',
    SPRINKLER: 'sprinkler',
    FLOOD: 'flood',
    FURROW: 'furrow',
    RAINFED: 'rainfed'
  }
};
