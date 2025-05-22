const express = require('express');
const ResumeUploadController = require('../controller/ResumeUploadController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/resume-upload', authenticateToken, ResumeUploadController.createResumeUpload);
router.get('/resume-upload/:id', authenticateToken, ResumeUploadController.findResumeUploadById);
router.put('/resume-upload/:id', authenticateToken, ResumeUploadController.updateResumeUpload);
router.delete('/resume-upload/:id', authenticateToken, ResumeUploadController.deleteResumeUpload);
router.get('/resume-upload', authenticateToken, ResumeUploadController.getAllResumeUpload);

module.exports = router;
