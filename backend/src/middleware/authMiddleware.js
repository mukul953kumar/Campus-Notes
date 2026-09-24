const User = require('../models/User');
const AppError = require('../utils/appError');
const { verifyToken } = require('../utils/token');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).populate('collegeId', 'name code');

    if (!user || !user.isActive) {
      return next(new AppError('User session expired or account disabled.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }
    next(error);
  }
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied: You lack sufficient permissions for this action.', 403));
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
