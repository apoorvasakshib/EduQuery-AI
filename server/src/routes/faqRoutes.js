const express = require('express');
const router = express.Router();
const { getFAQs, generateFAQsForDocument, updateFAQStatus, deleteFAQ } = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', getFAQs);
router.post('/generate', protect, requireRole('super_admin', 'dept_admin'), generateFAQsForDocument);
router.patch('/:id/status', protect, requireRole('super_admin', 'dept_admin'), updateFAQStatus);
router.delete('/:id', protect, requireRole('super_admin', 'dept_admin'), deleteFAQ);

module.exports = router;
