const express = require('express');
const {
  createReport,
  getReports,
  updateReportStatus
} = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { reportLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', requireAuth, reportLimiter, createReport);
router.get('/', requireAuth, requireRole(['admin']), getReports);
router.patch('/:id', requireAuth, requireRole(['admin']), updateReportStatus);

module.exports = router;
