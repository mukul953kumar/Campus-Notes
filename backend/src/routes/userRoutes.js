const express = require('express');
const { getProfile, updateProfile, getLeaderboard } = require('../controllers/userController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public leaderboard route
router.get('/leaderboard', optionalAuth, getLeaderboard);

// Protected student profile routes
router.use(requireAuth);
router.route('/profile')
  .get(getProfile)
  .patch(updateProfile);

module.exports = router;
