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

const ratingRoutes = require('./ratingRoutes');

const router = express.Router();

router.get('/', getResources);
router.get('/my-uploads', requireAuth, getMyUploads);
router.get('/:id', optionalAuth, getResourceById);
router.get('/:id/file', optionalAuth, streamResourceFile);
router.get('/:id/download', optionalAuth, downloadResource);
router.post('/upload', requireAuth, upload.single('file'), uploadResource);

// Mount rating endpoints
router.use('/:id/ratings', ratingRoutes);
router.use('/:id/rating', ratingRoutes);

module.exports = router;

