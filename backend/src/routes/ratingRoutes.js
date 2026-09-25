const express = require('express');
const {
  submitRating,
  getResourceRatings,
  getUserRating,
  deleteUserRating
} = require('../controllers/ratingController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Specific resource rating endpoints (e.g. /api/resources/:id/ratings or /api/ratings/:id)
router.get('/', optionalAuth, getResourceRatings);
router.post('/', requireAuth, submitRating);
router.get('/my-rating', requireAuth, getUserRating);
router.delete('/', requireAuth, deleteUserRating);

module.exports = router;
