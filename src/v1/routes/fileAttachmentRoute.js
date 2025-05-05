const express = require('express');
const fileAttachmentController = require('../controller/FileAttachmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/file-attachment', authenticateToken,upload.single('file'), fileAttachmentController.createAttachment);
router.get('/file-attachment/:id', authenticateToken,upload.single('file'), fileAttachmentController.getCallTypeById);
router.put('/file-attachment/:id', authenticateToken,upload.single('file'), fileAttachmentController.updateAttachment);
router.delete('/file-attachment/:id', authenticateToken,upload.single('file'), fileAttachmentController.deleteAttachment);
router.get('/file-attachment', authenticateToken,upload.single('file'), fileAttachmentController.getAllAttachment);

module.exports = router;
