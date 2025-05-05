const express = require('express');
const priceBookController = require('../controller/priceBookController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/price-book', authenticateToken, priceBookController.createPriceBook);
router.get('/price-book/:id', authenticateToken,  priceBookController.findPriceBookById);
router.put('/price-book/:id', authenticateToken,  priceBookController.updatePriceBook);
router.delete('/price-book/:id', authenticateToken, priceBookController.deletePriceBook);
router.get('/price-book', authenticateToken, priceBookController.getAllPriceBook);

module.exports = router;
