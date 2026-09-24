const express = require('express');
const {
  getAdminMetrics,
  getVerificationQueue,
  verifyResource,
  deleteResourceAdmin
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireRole(['admin']));

router.get('/metrics', getAdminMetrics);
router.get('/queue', getVerificationQueue);
router.patch('/resources/:id/verify', verifyResource);
router.delete('/resources/:id', deleteResourceAdmin);

module.exports = router;
