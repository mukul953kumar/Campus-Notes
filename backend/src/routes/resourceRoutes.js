const express = require('express');
const {
  getResources,
  getResourceById,
  uploadResource,
  downloadResource,
  streamResourceFile,
  getMyUploads
} = require('../controllers/resourceController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const ratingRoutes = require('./ratingRoutes');

const router = express.Router();

router.get('/', optionalAuth, getResources);
router.get('/my-uploads', requireAuth, getMyUploads);
router.get('/:id', requireAuth, getResourceById);
router.get('/:id/file', requireAuth, streamResourceFile);
router.get('/:id/download', requireAuth, downloadResource);
router.post('/upload', requireAuth, uploadLimiter, upload.single('file'), uploadResource);

// Mount rating endpoints
router.use('/:id/ratings', ratingRoutes);
router.use('/:id/rating', ratingRoutes);

module.exports = router;

