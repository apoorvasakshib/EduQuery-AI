const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', getDepartments);
router.post('/', protect, requireRole('super_admin', 'dept_admin'), createDepartment);
router.delete('/:id', protect, requireRole('super_admin'), deleteDepartment);

module.exports = router;
