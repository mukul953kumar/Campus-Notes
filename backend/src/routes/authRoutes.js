const express = require('express');
const { googleLogin, devLogin, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/google', googleLogin);
router.post('/dev-login', devLogin);
router.get('/me', requireAuth, getMe);

module.exports = router;
