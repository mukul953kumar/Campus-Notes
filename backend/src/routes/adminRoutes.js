const express = require('express');
const {
  getAdminMetrics,
  getVerificationQueue,
  getAllResourcesAdmin,
  verifyResource,
  deleteResourceAdmin,
  getAllUsersAdmin,
  updateUserAdmin
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication and 'admin' role
router.use(requireAuth, requireRole(['admin']));

// Metrics & Verification Queue
router.get('/metrics', getAdminMetrics);
router.get('/queue', getVerificationQueue);

// Full Resources Catalog & Moderation (Universal delete & verify)
router.get('/resources', getAllResourcesAdmin);
router.patch('/resources/:id/verify', verifyResource);
router.delete('/resources/:id', deleteResourceAdmin);

// User & Account Management
router.get('/users', getAllUsersAdmin);
router.patch('/users/:id', updateUserAdmin);

module.exports = router;
