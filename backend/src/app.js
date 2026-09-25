const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const academicRoutes = require('./routes/academicRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { generalApiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security HTTP headers
app.use(helmet());

// Apply global rate limiting across /api endpoints
app.use('/api', generalApiLimiter);

// CORS configuration
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredClientUrls,
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching allowedOrigins
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new AppError('Blocked by CORS policy', 403));
  },
  credentials: true
}));

// Body parsers with sensible payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for local upload fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root landing route for health & verification
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusNotes API Server is live and running 🚀',
    environment: process.env.NODE_ENV || 'development',
    healthCheck: '/api/health'
  });
});

// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
