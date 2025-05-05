// Currency Routes
const express = require('express');
const currencyController = require('../controller/currencyController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/currencies', authenticateToken, currencyController.createCurrency);
router.get('/currencies/:id', authenticateToken, currencyController.getCurrencyById);
router.put('/currencies/:id', authenticateToken, currencyController.updateCurrency);
router.delete('/currencies/:id', authenticateToken, currencyController.deleteCurrency);
router.get('/currencies', authenticateToken, currencyController.getAllCurrencies);

module.exports = router;