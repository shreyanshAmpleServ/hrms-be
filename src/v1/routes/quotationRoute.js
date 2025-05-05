const express = require('express');
const quotaionController = require('../controller/quotaionController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/quotation', authenticateToken, upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),   quotaionController.createQuotation);
router.get('/quotation/:id', authenticateToken,  quotaionController.getQuotationById);
router.put('/quotation/:id', authenticateToken,upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),  quotaionController.updateQuotaion);
router.delete('/quotation/:id', authenticateToken, quotaionController.deleteQuotation);
router.get('/quotation', authenticateToken, quotaionController.getAllQuotaion);
router.get('/get-quotation-code', authenticateToken, quotaionController.generateQuotaionCode);

module.exports = router;
