const express = require('express');
const wpsFileLogController = require('../controller/wpsFileLogController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/wps-file', authenticateToken,upload.single('file_path'), wpsFileLogController.createWPSFile);
router.get('/wps-file/:id', authenticateToken, wpsFileLogController.findWPSFileById);
router.put('/wps-file/:id', authenticateToken,upload.single('file_path'), wpsFileLogController.updateWPSFile);
router.delete('/wps-file/:id', authenticateToken, wpsFileLogController.deleteWPSFile);
router.get('/wps-file', authenticateToken, wpsFileLogController.getAllWPSFile);

module.exports = router;
