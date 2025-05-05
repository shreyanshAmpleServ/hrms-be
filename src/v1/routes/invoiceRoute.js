const express = require('express');
const invoiceController = require('../controller/invoiceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/sales-invoice', authenticateToken, upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),   invoiceController.createInvoice);
router.put('/sales-invoice/:id', authenticateToken,upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),  invoiceController.updateInvoice);
router.delete('/sales-invoice/:id', authenticateToken, invoiceController.deleteInvoice);
router.get('/sales-invoice', authenticateToken, invoiceController.getAllInvoice);
router.get('/get-sales-invoice-code', authenticateToken, invoiceController.generateInvoiceCode);
router.get('/purchase-order/:id', authenticateToken,  invoiceController.getInvoiceById);
// router.get('/sales-types', authenticateToken, invoiceController.getSalesType);

module.exports = router;
