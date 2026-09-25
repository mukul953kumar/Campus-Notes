const express = require('express');
const { googleLogin, devLogin, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/google', authLimiter, googleLogin);
router.post('/dev-login', authLimiter, devLogin);
router.get('/me', requireAuth, getMe);

module.exports = router;
