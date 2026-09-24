const express = require('express');
const {
  createReport,
  getReports,
  updateReportStatus
} = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, createReport);
router.get('/', requireAuth, requireRole(['admin']), getReports);
router.patch('/:id', requireAuth, requireRole(['admin']), updateReportStatus);

module.exports = router;
