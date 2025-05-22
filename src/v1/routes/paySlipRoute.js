const express = require('express');
const paySlipController = require('../controller/paySlipController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/payslip', authenticateToken,upload.single('pdf_path'), paySlipController.createPaySlip);
router.get('/payslip/:id', authenticateToken, paySlipController.findPaySlipById);
router.put('/payslip/:id', authenticateToken,upload.single('pdf_path'), paySlipController.updatePaySlip);
router.delete('/payslip/:id', authenticateToken, paySlipController.deletePaySlip);
router.get('/payslip', authenticateToken, paySlipController.getAllPaySlip);

module.exports = router;
