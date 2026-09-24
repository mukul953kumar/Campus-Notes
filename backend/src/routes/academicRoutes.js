const express = require('express');
const {
  getBranches,
  getSubjects,
  getSubjectById,
  createSubject
} = require('../controllers/academicController');

const router = express.Router();

router.get('/branches', getBranches);
router.get('/subjects', getSubjects);
router.get('/subjects/:id', getSubjectById);
router.post('/subjects', createSubject);

module.exports = router;
