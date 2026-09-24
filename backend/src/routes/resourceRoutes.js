const express = require('express');
const {
  getResources,
  getResourceById,
  uploadResource,
  downloadResource
} = require('../controllers/resourceController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getResources);
router.get('/:id', optionalAuth, getResourceById);
router.get('/:id/download', optionalAuth, downloadResource);
router.post('/upload', requireAuth, upload.single('file'), uploadResource);

module.exports = router;
