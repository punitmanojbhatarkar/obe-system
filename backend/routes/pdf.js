const express = require('express');
const router = express.Router();
const { generatePDF, getPDFPreview } = require('../controllers/pdfController');
const { auth, requireContextAccess } = require('../middleware/auth');

router.use(auth);
router.get('/:contextId/generate', requireContextAccess, generatePDF);
router.get('/:contextId/preview', requireContextAccess, getPDFPreview);

module.exports = router;
