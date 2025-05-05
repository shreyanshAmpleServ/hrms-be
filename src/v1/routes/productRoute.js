const express = require('express');
const productController = require('../controller/productController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Import the upload middleware

const router = express.Router();

router.post('/products', authenticateToken,  upload.single('product_image'), productController.createProduct);
router.get('/products/:id', authenticateToken, productController.findProductById);
router.put('/products/:id', authenticateToken, upload.single('product_image'), productController.updateProduct);
router.delete('/products/:id', authenticateToken, productController.deleteProduct);
router.get('/products', authenticateToken, productController.getAllProduct);

module.exports = router;
