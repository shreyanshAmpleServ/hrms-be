const express = require('express');
const orderController = require('../controller/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadFileMiddleware');

const router = express.Router();

router.post('/order', authenticateToken, upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),   orderController.createOrder);
router.get('/order/:id', authenticateToken,  orderController.getOrderById);
router.put('/order/:id', authenticateToken,upload.fields([{ name: 'attachment1' }, { name: 'attachment2' }]),  orderController.updateOrder);
router.delete('/order/:id', authenticateToken, orderController.deleteOrder);
router.get('/order', authenticateToken, orderController.getAllOrder);
router.get('/sales-types', authenticateToken, orderController.getSalesType);
router.get('/get-order-code', authenticateToken, orderController.generateOrderCode);

module.exports = router;
