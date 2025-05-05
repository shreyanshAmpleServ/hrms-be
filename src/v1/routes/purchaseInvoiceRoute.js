const express = require('express');
const purchaseInvoiceController = require('../controller/purchaseInvoiceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/purchase-invoice', authenticateToken, upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),   purchaseInvoiceController.createPurchaseInvoice);
router.put('/purchase-invoice/:id', authenticateToken,upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),  purchaseInvoiceController.updatePurchaseInvoice);
router.delete('/purchase-invoice/:id', authenticateToken, purchaseInvoiceController.deletePurchaseInvoice);
router.get('/purchase-invoice', authenticateToken, purchaseInvoiceController.getAllPurchaseInvoice);
router.get('/get-purchase-invoice-code', authenticateToken, purchaseInvoiceController.generatePurchaseInvoiceCode);
router.get('/purchase-order/:id', authenticateToken,  purchaseInvoiceController.getPurchaseInvoiceById);
// router.get('/sales-types', authenticateToken, purchaseInvoiceController.getSalesType);

module.exports = router;
