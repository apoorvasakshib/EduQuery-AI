const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheck');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    const hasAllowedExt = /\.(pdf|png|jpe?g)$/i.test(file.originalname);
    if (allowedMimeTypes.includes(file.mimetype) || hasAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported File Type. Only PDF, PNG, JPG, and JPEG files are permitted.'));
    }
  },
});

router.use(protect);
router.use(requireRole('super_admin', 'dept_admin'));

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);
router.delete('/documents/:id', deleteDocument);

module.exports = router;
