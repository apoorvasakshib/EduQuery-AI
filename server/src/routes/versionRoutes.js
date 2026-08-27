const express = require('express');
const multer = require('multer');
const router = express.Router();
const { getDocumentVersions, uploadNewVersion, setActiveVersion } = require('../controllers/versionController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(protect);
router.use(requireRole('super_admin', 'dept_admin'));

router.get('/:documentId/versions', getDocumentVersions);
router.post('/:documentId/versions', upload.single('file'), uploadNewVersion);
router.patch('/:documentId/versions/:versionId/activate', setActiveVersion);

module.exports = router;
