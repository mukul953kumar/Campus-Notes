const express = require('express');
const { sendResponse } = require('../utils/apiResponse');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint returning system status and uptime
 * @access  Public
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development'
  };

  return sendResponse(res, {
    statusCode: 200,
    message: 'CampusNotes API server is running smoothly',
    data: healthData
  });
});

module.exports = router;
