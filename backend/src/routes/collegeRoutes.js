const express = require('express');
const {
  getAllColleges,
  getCollegeById,
  createCollege
} = require('../controllers/collegeController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getAllColleges)
  .post(requireAuth, requireRole(['admin']), createCollege);

router.route('/:id')
  .get(getCollegeById);

module.exports = router;
