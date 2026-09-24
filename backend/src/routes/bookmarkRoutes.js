const express = require('express');
const {
  toggleBookmark,
  getBookmarks,
  getBookmarkIds
} = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getBookmarks);
router.get('/ids', getBookmarkIds);
router.post('/:resourceId', toggleBookmark);

module.exports = router;
