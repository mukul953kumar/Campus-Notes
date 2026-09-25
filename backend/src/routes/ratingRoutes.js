const express = require('express');
const {
  submitRating,
  getResourceRatings,
  getUserRating,
  deleteUserRating,
  getMyReviews
} = require('../controllers/ratingController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.get('/my-reviews', requireAuth, getMyReviews);
router.get('/', optionalAuth, getResourceRatings);
router.post('/', requireAuth, submitRating);
router.get('/my-rating', requireAuth, getUserRating);
router.delete('/', requireAuth, deleteUserRating);

module.exports = router;
