const express = require('express');
const purchaseOrderController = require('../controller/purchaseOrderController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/purchase-order', authenticateToken, upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),   purchaseOrderController.createPurchaseOrder);
router.put('/purchase-order/:id', authenticateToken,upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),  purchaseOrderController.updatePurchaseOrder);
router.delete('/purchase-order/:id', authenticateToken, purchaseOrderController.deletePurchaseOrder);
router.get('/purchase-order', authenticateToken, purchaseOrderController.getAllPurchaseOrder);
router.get('/get-purchase-order-code', authenticateToken, purchaseOrderController.generatePurchaseOrderCode);
router.get('/purchase-order/:id', authenticateToken,  purchaseOrderController.getPurchaseOrderById);
// router.get('/sales-types', authenticateToken, purchaseOrderController.getSalesType);

module.exports = router;
