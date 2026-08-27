const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

router.get('/dashboard', protect, requireRole('super_admin', 'dept_admin'), getDashboardStats);

module.exports = router;
