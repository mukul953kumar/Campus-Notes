const express = require('express');
const {
  getAllColleges,
  getCollegeById,
  createCollege
} = require('../controllers/collegeController');

const router = express.Router();

router.route('/')
  .get(getAllColleges)
  .post(createCollege);

router.route('/:id')
  .get(getCollegeById);

module.exports = router;
