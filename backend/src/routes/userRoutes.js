const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.route('/profile')
  .get(getProfile)
  .patch(updateProfile);

module.exports = router;
