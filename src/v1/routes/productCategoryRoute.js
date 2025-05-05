const express = require('express');
const productCategoryController = require('../controller/ProductCategoryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/product-category', authenticateToken, productCategoryController.createProductCategory);
router.get('/product-category/:id', authenticateToken, productCategoryController.findCategoryById);
router.put('/product-category/:id', authenticateToken, productCategoryController.updateProductCategory);
router.delete('/product-category/:id', authenticateToken, productCategoryController.deleteProductCategory);
router.get('/product-category', authenticateToken, productCategoryController.getAllProductCategory);

module.exports = router;
