const express = require('express');
const router = express.Router();
const { getCollections, createCollection, deleteCollection } = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', getCollections);
router.post('/', protect, requireRole('super_admin', 'dept_admin'), createCollection);
router.delete('/:id', protect, requireRole('super_admin', 'dept_admin'), deleteCollection);

module.exports = router;
