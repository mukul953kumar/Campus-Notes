const express = require('express');
const {
  getBranches,
  getSubjects,
  getSubjectById,
  createSubject
} = require('../controllers/academicController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/branches', getBranches);
router.get('/subjects', getSubjects);
router.get('/subjects/:id', getSubjectById);
router.post('/subjects', requireAuth, requireRole(['admin']), createSubject);

module.exports = router;
