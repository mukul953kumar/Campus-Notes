const express = require('express');
const {
  getResources,
  getResourceById,
  uploadResource
} = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getResources);
router.get('/:id', getResourceById);
router.post('/upload', requireAuth, upload.single('file'), uploadResource);

module.exports = router;
