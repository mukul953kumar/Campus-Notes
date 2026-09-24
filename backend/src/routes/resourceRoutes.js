const express = require('express');
const { getResources, getResourceById } = require('../controllers/resourceController');

const router = express.Router();

router.get('/', getResources);
router.get('/:id', getResourceById);

module.exports = router;
