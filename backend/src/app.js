const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// Middleware imports
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logging');

// Route imports
const authRoutes = require('./features/auth/auth.route');
const userRoutes = require('./features/user/user.route');
const farmRoutes = require('./features/farm/farm.route');
const fieldRoutes = require('./features/field/field.route');
const cropRoutes = require('./features/crop/crop.route');
const productRoutes = require('./features/product/product.route');
const orderRoutes = require('./features/order/order.route');
const weatherRoutes = require('./features/weather/weather.route');

const app = express();

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation placeholder
app.get('/api-docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      farms: '/api/v1/farms',
      fields: '/api/v1/fields',
      crops: '/api/v1/crops',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      weather: '/api/v1/weather'
    }
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/farms`, farmRoutes);
app.use(`/api/${API_VERSION}/fields`, fieldRoutes);
app.use(`/api/${API_VERSION}/crops`, cropRoutes);
app.use(`/api/${API_VERSION}/products`, productRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/weather`, weatherRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
